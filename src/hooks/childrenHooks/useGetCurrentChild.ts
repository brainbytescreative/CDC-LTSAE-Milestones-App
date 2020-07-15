import {useQuery} from 'react-query';
import {sqLiteClient} from '../../db';
import {parseISO} from 'date-fns';
import {pathFromDB} from '../../resources/constants';
import {useGetCurrentChildId} from './useGetCurrentChildId';
import {ChildResult} from '../types';

export function useGetCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  return useQuery<ChildResult, [string, {id?: number}]>(['selectedChild', {id: selectedChildId}], async () => {
    let result = await sqLiteClient.dB?.executeSql('select * from children where id=?1', [selectedChildId]);
    if (!result || result[0].rows.length === 0) {
      result = await sqLiteClient.dB?.executeSql('select * from children LIMIT 1');
    }

    const child = (result && result[0].rows.item(0)) || {};

    return {
      ...child,
      photo: pathFromDB(child.photo),
      birthday: child.birthday && parseISO(child.birthday),
    };
  });
}
