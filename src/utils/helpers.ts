import {DateTimePickerProps} from 'react-native-modal-datetime-picker';
import i18next from '../resources/l18n';
import {format} from 'date-fns';
import {dateFnsLocales} from '../resources/dateFnsLocales';
import _ from 'lodash';
import {TFunction} from 'i18next';
import {ChildResult} from '../hooks/childrenHooks';

export const formatDate = (dateVal?: Date, mode: DateTimePickerProps['mode'] = 'date') => {
  switch (mode) {
    case 'date':
      return (dateVal && format(dateVal, i18next.t('common:dateFormat'))) || '';
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

export const tOpt = ({t, child}: {t: TFunction; child?: ChildResult | undefined}) => ({
  hisHersTag: t('common:hisHersTag', {context: `${child?.gender}`}),
  heSheTag: t('common:heSheTag', {context: `${child?.gender}`}),
  himHerTag: t('common:himHerTag', {context: `${child?.gender}`}),
  himselfHerselfTag: t('common:himselfHerselfTag', {context: `${child?.gender}`}),
  heSheUpperTag: t('common:heSheUpperTag', {context: `${child?.gender}`}),
});
