import {NavigationContainerProps} from '@react-navigation/native';
import {add, differenceInDays, differenceInMonths, differenceInWeeks, differenceInYears, format} from 'date-fns';
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

export const formatAge = (childBirth: Date | undefined, options?: {singular?: boolean; lng?: string}): string => {
  const birthDay = childBirth ?? new Date();
  const days = (birthDay && differenceInDays(new Date(), birthDay)) || 0;
  const months = (birthDay && differenceInMonths(new Date(), birthDay)) || 0;
  let ageText: string;
  let value: number;

  if (days < 7) {
    value = days > 0 ? days : 0;
    ageText = i18next.t('common:day', {count: options?.singular ? 1 : value, lng: options?.lng});
  } else if (months < 2) {
    const weeks = (birthDay && differenceInWeeks(new Date(), birthDay)) || 0;
    value = weeks;
    ageText = i18next.t('common:week', {count: options?.singular ? 1 : weeks, lng: options?.lng});
  } else if (months === 12) {
    value = 1;
    ageText = i18next.t('common:year', {count: 1, lng: options?.lng});
  } else if (months < 24 || (months > 29 && months < 36)) {
    value = months;
    ageText = i18next.t('common:month', {count: options?.singular ? 1 : months, lng: options?.lng});
  } else {
    const years = (birthDay && differenceInYears(new Date(), birthDay)) || 0;
    value = years;
    ageText = i18next.t('common:year', {count: options?.singular ? 1 : years, lng: options?.lng});
  }

  ageText = options?.singular ? ageText.replace('1', String(value)) : ageText;

  return ageText;
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
      const inDays = differenceInDays(nextMilestoneDate, baseDate);

      betweenCheckList = inDays > 13;

      /**
       * Ensure checklist functionality is as follows:
       *    Within two weeks of child's next birthday,
       *    they should be served the next age checklist.
       */
      if (inDays < 14) {
        milestoneAge = nextMilestoneId;
      }
      // // less than 1 month minus 1 day before next milestone
      // const leftSide = add(birthDay, {months: milestoneAge - 1, days: -1});
      // // basedate < less than: leftCompare = -1
      // const leftCompare = compareAsc(baseDate, leftSide);
      // // greater than or equal to 2 weeks before next milestone
      // const rightSide = add(birthDay, {months: milestoneAge, weeks: -2});
      // // rightCompare == 0 || rightCompare == 1
      // const rightCompare = compareAsc(baseDate, rightSide);
      // betweenCheckList = leftCompare < 0 && rightCompare >= 0;
    }

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

type TableNames = 'children' | 'appointments' | 'milestones_answers' | 'concern_answers';
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

export function formattedAge(milestoneAge: number, t: TFunction, singular = false, englishFromCapitalLetter = false) {
  const singularSuffix = singular ? 'Singular' : '';
  let milestoneAgeFormatted =
    milestoneAge % 12 === 0
      ? t(`common:year${singularSuffix}`, {count: milestoneAge / 12})
      : t(`common:month${singularSuffix}`, {count: milestoneAge});
  const milestoneAgeFormattedDashes =
    milestoneAge % 12 === 0
      ? t('common:yearDash', {count: milestoneAge / 12})
      : t('common:monthDash', {count: milestoneAge});
  milestoneAgeFormatted = i18next.language === 'en' && englishFromCapitalLetter ? _.startCase(milestoneAgeFormatted) : milestoneAgeFormatted;
  return {milestoneAgeFormatted, milestoneAgeFormattedDashes};
}

export const formattedAgeSingular = (t: TFunction, milestoneAge?: number) => {
  const ageText = milestoneAge ? formattedAge(milestoneAge, t, true).milestoneAgeFormatted : '';
  return i18next.language === 'en' ? _.startCase(ageText) : ageText;
};

export const tOpt = ({t, gender}: {t: TFunction; gender?: number}) => ({
  heSheTag: t('common:heSheTag', {context: `${gender}`}),
  heSheUpperTag: t('common:heSheUpperTag', {context: `${gender}`}),
  himHerTag: t('common:himHerTag', {context: `${gender}`}),
  himselfHerselfTag: t('common:himselfHerselfTag', {context: `${gender}`}),
  hisHersTag: t('common:hisHersTag', {context: `${gender}`}),
  hisHerTag: t('common:hisHerTag', {context: `${gender}`}),
  hijoHijaTag: t('common:hijoHijaTag', {context: `${gender}`}),
  ninoNinaTag: t('common:ninoNinaTag', {context: `${gender}`}),
  oaSpanishEndingTag: t('common:oaSpanishEndingTag', {context: `${gender}`}),
  aSpanishEndingTag: t('common:aSpanishEndingTag', {context: `${gender}`}),
  elEllaTag: t('common:elEllaTag', {context: `${gender}`}),
  elEllaCapitalTag: t('common:elEllaCapitalTag', {context: `${gender}`}),
  alAlaTag: t('common:alAlaTag', {context: `${gender}`}),
  delDelaTag: t('common:delDelaTag', {context: `${gender}`}),
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

export const navStateForAppointmentsList = {
  index: 0,
  routes: [
    {
      name: 'DashboardStack',
      state: {
        index: 0,
        routes: [
          {
            name: 'Dashboard',
            params: {
              appointments: true,
            },
          },
        ],
      },
    },
  ],
};

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
