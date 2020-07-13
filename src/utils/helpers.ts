import {DateTimePickerProps} from 'react-native-modal-datetime-picker';
import i18next from '../resources/l18n';
import {differenceInDays, differenceInMonths, format, formatDistanceStrict} from 'date-fns';
import {dateFnsLocales} from '../resources/dateFnsLocales';
import _ from 'lodash';
import {TFunction} from 'i18next';
import {milestonesIds, missingConcerns, PropType, tooYongAgeDays} from '../resources/constants';
import {sqLiteClient} from '../db';
import {Answer} from '../hooks/types';
import {AppointmentDb} from '../hooks/appointmentsHooks';
import {NavigationContainerProps} from '@react-navigation/native';

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

export const formatAge = (childBirth: Date | undefined): string => {
  const birthDay = childBirth ?? new Date();
  const days = (birthDay && differenceInDays(new Date(), birthDay)) || 0;
  const childAge = formatDistanceStrict(days < 1 ? birthDay : new Date(), birthDay, {
    unit: days > 0 ? undefined : 'day',
    roundingMethod: 'floor',
    locale: dateFnsLocales[i18next.language],
  });

  return birthDay ? childAge : '';
};

export function calcChildAge(birthDay: Date | undefined) {
  let isTooYong = false;
  let milestoneAge;
  let ageMonth: number;
  if (birthDay) {
    ageMonth = differenceInMonths(new Date(), birthDay);
    const minAge = _.min(milestonesIds) || 0;
    const maxAge = _.max(milestonesIds) || Infinity;

    if (ageMonth <= minAge) {
      milestoneAge = minAge;
      const ageDays = differenceInDays(new Date(), birthDay);
      isTooYong = ageDays < tooYongAgeDays;
    } else if (ageMonth >= maxAge) {
      milestoneAge = maxAge;
    } else {
      const milestones = milestonesIds.filter((value) => value <= ageMonth);
      milestoneAge = _.last(milestones);
    }
    return {milestoneAge, isTooYong, ageMonth};
  }
  return {isTooYong: false};
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
