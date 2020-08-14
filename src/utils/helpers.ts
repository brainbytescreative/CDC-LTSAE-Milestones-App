import {NavigationContainerProps} from '@react-navigation/native';
import {add, differenceInDays, differenceInMonths, differenceInWeeks, format, formatDistanceStrict} from 'date-fns';
import {TFunction} from 'i18next';
import _ from 'lodash';
import {DateTimePickerProps} from 'react-native-modal-datetime-picker';

import {sqLiteClient} from '../db';
import {Answer, Appointment, AppointmentDb} from '../hooks/types';
import {NoExtraProperties, PropType, milestonesIds, missingConcerns} from '../resources/constants';
import {dateFnsLocales} from '../resources/dateFnsLocales';
import i18next from '../resources/l18n';

export const formatDate = (dateVal?: Date, mode: DateTimePickerProps['mode'] = 'date') => {
  switch (mode) {
    case 'date':
      return (
        (dateVal &&
          format(dateVal, i18next.t('common:dateFormat'), {
            locale: dateFnsLocales[i18next.language],
          })) ||
        ''
      );
    case 'time':
      return (
        (dateVal &&
          format(dateVal, i18next.t('common:timeFormat'), {
            locale: dateFnsLocales[i18next.language],
          })) ||
        ''
      );
    case 'datetime':
      return (dateVal && format(dateVal, i18next.t('common:dateTimeFormat'))) || '';
  }
};

type UnitsType = NonNullable<Parameters<typeof formatDistanceStrict>[2]>['unit'];

export const formatAge = (childBirth: Date | undefined): string => {
  const birthDay = childBirth ?? new Date();
  const days = (birthDay && differenceInDays(new Date(), birthDay)) || 0;
  const months = (birthDay && differenceInMonths(new Date(), birthDay)) || 0;

  let unit: UnitsType; //= days > 0 ? undefined : 'day';

  if (days < 7) {
    unit = 'day';
  } else if (months < 2) {
    const weeks = (birthDay && differenceInWeeks(new Date(), birthDay)) || 0;
    return i18next.t('common:week', {count: weeks});
  } else if (months < 24) {
    unit = 'month';
  }

  const childAge = formatDistanceStrict(days < 1 ? birthDay : new Date(), birthDay, {
    unit,
    roundingMethod: 'floor',
    locale: dateFnsLocales[i18next.language],
  });

  return birthDay ? childAge : '';
};

export function calcChildAge(birthDay: Date | undefined) {
  // let isTooYong = false;
  let milestoneAge;
  let ageMonth: number;
  let ageDay: number;
  // let nextMilestone: Date | undefined;
  let betweenCheckList = false;

  if (birthDay && _.isDate(birthDay)) {
    ageMonth = differenceInMonths(new Date(), birthDay);
    ageDay = differenceInDays(new Date(), birthDay);

    // Current age in date format
    const baseDate = add(birthDay, {days: ageDay});
    const minAge = _.min(milestonesIds) || 0;
    const maxAge = _.max(milestonesIds) || Infinity;

    if (ageMonth <= minAge) {
      milestoneAge = minAge;
      // const ageDays = differenceInDays(new Date(), birthDay);
      // isTooYong = ageDays < tooYongAgeDays;
    } else if (ageMonth >= maxAge) {
      milestoneAge = maxAge;
    } else {
      const milestones = milestonesIds.filter((value) => value <= ageMonth);
      milestoneAge = _.last(milestones);
    }

    const currentIndex = milestonesIds.indexOf(milestoneAge as never);
    const nextMilestoneId = milestonesIds[currentIndex + 1];

    if (nextMilestoneId) {
      /**
       * If the selected child's age is greater than or equal to 2 weeks before
       * next milestone age and less than 1 month minus 1 day before next milestone,
       * no message will be displayed.
       */
      const nextMilestoneDate = add(birthDay, {months: nextMilestoneId});
      const inWeeks = differenceInDays(nextMilestoneDate, baseDate);

      betweenCheckList = inWeeks > 13;

      /**
       * Ensure checklist functionality is as follows:
       *    Within two weeks of child's next birthday,
       *    they should be served the next age checklist.
       */
      if (inWeeks < 14) {
        milestoneAge = nextMilestoneId;
      }
      // console.log('<<<inWeeks', inWeeks, baseDate);

      // console.log(inWeeks, betweenCheckList);
      // // less than 1 month minus 1 day before next milestone
      // const leftSide = add(birthDay, {months: milestoneAge - 1, days: -1});
      // // basedate < less than: leftCompare = -1
      // const leftCompare = compareAsc(baseDate, leftSide);
      // // greater than or equal to 2 weeks before next milestone
      // const rightSide = add(birthDay, {months: milestoneAge, weeks: -2});
      // // rightCompare == 0 || rightCompare == 1
      // const rightCompare = compareAsc(baseDate, rightSide);
      // betweenCheckList = leftCompare < 0 && rightCompare >= 0;
      // console.log(leftSide, rightSide, baseDate);
      // // console.log(leftCompare, rightCompare, baseDate, leftSide, birthDay);
      // console.log(baseDate, betweenCheckList);
      // console.log(add(new Date(), {years: -4, weeks: 1}));
    }

    // console.log(add(startOfDay(new Date()), {months: -12, days: 14}));

    return {milestoneAge, ageMonth, betweenCheckList};
  }
  return {isTooYong: false, betweenCheckList};
}

export async function checkMissingMilestones(milestoneId: number, childId: number) {
  const notYetRes = await sqLiteClient.dB?.executeSql(
    'SELECT questionId FROM milestones_answers WHERE milestoneId=? AND childId=? AND answer=? LIMIT 1',
    [milestoneId, childId, Answer.NOT_YET],
  );
  const unsureRes = await sqLiteClient.dB?.executeSql(
    'SELECT questionId FROM milestones_answers WHERE milestoneId=? AND childId=? AND answer=? LIMIT 1',
    [milestoneId, childId, Answer.UNSURE],
  );

  const concernsRes = await sqLiteClient.dB?.executeSql(
    `SELECT concernId FROM concern_answers WHERE concernId NOT IN (${missingConcerns.join(
      ',',
    )}) AND milestoneId=? AND childId=? AND answer=? LIMIT 1`,
    [milestoneId, childId, 1],
  );

  const isMissingConcern = (concernsRes && concernsRes[0].rows.length > 0) || false;
  const isNotYet = (notYetRes && notYetRes[0].rows.length > 0) || false;
  const isNotSure = (unsureRes && unsureRes[0].rows.length > 0) || false;
  return {isMissingConcern, isNotYet, isNotSure};
}

type TableNames = 'children' | 'appointments' | 'milestones_answers';
type QueryType = 'insert' | 'updateById';

export interface UpdateTableTypes {
  appointments: Omit<Partial<Appointment>, 'id'>;
}

export async function updateByIdQuery<K extends keyof UpdateTableTypes, T>(
  id: number,
  table: K,
  updateData: NoExtraProperties<UpdateTableTypes[K], T>,
) {
  const keys = Object.keys(updateData);
  const values = Object.values(updateData);

  if (values.length === 0) {
    throw new Error('Nothing to update');
  }

  const query = `UPDATE ${table} SET ${keys.map((value, index) => ` ${value}=?${index + 2}`).join(', ')} WHERE id=?1`;

  const [result] = await sqLiteClient.db.executeSql(query, [id, ...values]);

  if (result.rowsAffected === 0) {
    throw new Error('Update failed');
  }

  return result.rowsAffected;
}

export function objectToQuery<T extends Record<string, any>>(
  object: T,
  tableName: TableNames,
  queryType: QueryType = 'insert',
): [string, any[]] {
  const omited = _.omit(object, ['id']);
  const values = Object.values(omited);
  const variables = Object.keys(omited);

  switch (queryType) {
    case 'updateById':
      return [
        `
          UPDATE ${tableName} set ${variables.map((value) => `${value} = ?`).join(', ')} where id = ?`,
        [...values, object.id],
      ];
    case 'insert':
      return [
        `
          INSERT INTO ${tableName} (${variables.join(',')})
          VALUES (${values.map(() => '?').join(',')})`,
        values,
      ];
    default: {
      throw new Error('unsupported type');
    }
  }
}

export function formattedAge(milestoneAge: number, t: TFunction, singular = false) {
  const singularSuffix = singular ? 'Singular' : '';
  const milestoneAgeFormatted =
    milestoneAge % 12 === 0
      ? t(`common:year${singularSuffix}`, {count: milestoneAge / 12})
      : t(`common:month${singularSuffix}`, {count: milestoneAge});
  const milestoneAgeFormattedDashes =
    milestoneAge % 12 === 0
      ? t('common:yearDash', {count: milestoneAge / 12})
      : t('common:monthDash', {count: milestoneAge});
  return {milestoneAgeFormatted, milestoneAgeFormattedDashes};
}

export const tOpt = ({t, gender}: {t: TFunction; gender?: number}) => ({
  hisHersTag: t('common:hisHersTag', {context: `${gender}`}),
  heSheTag: t('common:heSheTag', {context: `${gender}`}),
  himHerTag: t('common:himHerTag', {context: `${gender}`}),
  himselfHerselfTag: t('common:himselfHerselfTag', {context: `${gender}`}),
  heSheUpperTag: t('common:heSheUpperTag', {context: `${gender}`}),
});

export function slowdown<T>(promise: Promise<T> | T, timeOut = 300): Promise<T> {
  return Promise.all([new Promise((resolve) => setTimeout(resolve, timeOut)), Promise.resolve(promise)]).then(
    ([, res]) => res,
  );
}

export const navStateForAppointmentID = (appointmentId: PropType<AppointmentDb, 'id'>) => ({
  index: 0,
  routes: [
    {
      name: 'DashboardStack',
      state: {
        index: 1,
        routes: [
          {
            name: 'Dashboard',
          },
          {
            name: 'Appointment',
            params: {
              appointmentId: appointmentId,
            },
          },
        ],
      },
    },
  ],
});

type NavState = Parameters<NonNullable<PropType<NavigationContainerProps, 'onStateChange'>>>[0];

// Gets the current screen from navigation state
export const getActiveRouteName: (state: NavState) => string | undefined = (state) => {
  const route = state?.routes[state.index];

  if (route?.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state as any);
  }

  return route?.name;
};
