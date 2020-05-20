import {DateTimePickerProps} from 'react-native-modal-datetime-picker';
import i18next from '../resources/l18n';
import {differenceInDays, differenceInMonths, format, formatDistanceStrict} from 'date-fns';
import {dateFnsLocales} from '../resources/dateFnsLocales';
import _ from 'lodash';
import {TFunction} from 'i18next';
import * as MailComposer from 'expo-mail-composer';
import nunjucks from 'nunjucks';
import emailSummaryContent from '../resources/EmailChildSummary';
import {ChildResult} from '../hooks/childrenHooks';
import {childAges, tooYongAgeDays} from '../resources/constants';

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
  const days = (childBirth && Math.abs(differenceInDays(new Date(), childBirth))) || 0;
  return childBirth
    ? formatDistanceStrict(new Date(), childBirth, {
        unit: days > 0 ? undefined : 'day',
        roundingMethod: 'floor',
        locale: dateFnsLocales[i18next.language],
      })
    : '';
};

export function calcChildAge(birthDay: Date | undefined) {
  let isTooYong = false;
  let milestoneAge;
  if (birthDay) {
    const ageMonth = differenceInMonths(new Date(), birthDay);
    const minAge = _.min(childAges) || 0;
    const maxAge = _.max(childAges) || Infinity;

    if (ageMonth <= minAge) {
      milestoneAge = minAge;
      const ageDays = differenceInDays(new Date(), birthDay);
      isTooYong = ageDays < tooYongAgeDays;
    } else if (ageMonth >= maxAge) {
      milestoneAge = maxAge;
    } else {
      const milestones = childAges.filter((value) => value <= ageMonth);
      milestoneAge = _.last(milestones);
    }
  }
  return {milestoneAge, isTooYong};
}

type TableNames = 'children' | 'appointments';
type QueryType = 'insert' | 'updateById';

export function objectToQuery(object: any, tableName: TableNames, queryType: QueryType = 'insert'): [string, any[]] {
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

export const tOpt = ({t, gender}: {t: TFunction; gender?: number}) => ({
  hisHersTag: t('common:hisHersTag', {context: `${gender}`}),
  heSheTag: t('common:heSheTag', {context: `${gender}`}),
  himHerTag: t('common:himHerTag', {context: `${gender}`}),
  himselfHerselfTag: t('common:himselfHerselfTag', {context: `${gender}`}),
  heSheUpperTag: t('common:heSheUpperTag', {context: `${gender}`}),
});
