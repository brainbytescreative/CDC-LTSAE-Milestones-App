import {parseISO} from 'date-fns';
import {useQuery} from 'react-query';

import {sqLiteClient} from '../../db';
import {pathFromDB} from '../../resources/constants';
import {ChildResult, Key} from '../types';
import {ChildDbRecord} from './index';

export function useGetChild(options: {id: number | string | undefined}) {
  return useQuery<ChildResult | undefined, [Key, typeof options]>(
    ['children', options],
    async (key, variables) => {
      if (!variables.id) {
        return;
      }

      const [result] = await sqLiteClient.db.executeSql('select * from children where id = ?', [variables.id]);
      const record: ChildDbRecord = result.rows.item(0);
      return {
        ...record,
        photo: pathFromDB(record.photo),
        birthday: parseISO(record.birthday),
      };
    },
    {enabled: Boolean(options.id)},
  );
}
