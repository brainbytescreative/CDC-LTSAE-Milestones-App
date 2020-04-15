import {queryCache, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {formatISO, parseISO} from 'date-fns';
import Storage from '../utils/Storage';
import {objectToQuery} from '../utils/helpers';

interface Record {
  id: number;
}

export interface ChildDbRecord extends Record {
  name: string;
  birthday: string;
  gender: number;
  doctorName?: string | undefined;
  parentName?: string | undefined;
  parentEmail?: string | undefined;
  doctorEmail?: string | undefined;
  photo?: string | undefined;
}
export interface ChildResult extends Omit<ChildDbRecord, 'birthday'> {
  birthday: Date;
}

type Key = 'children' | 'selectedChild';

export function useGetCurrentChild() {
  return useQuery<ChildResult, Key>(
    'selectedChild',
    async () => {
      let selectedChild: string | null = await Storage.getItem('selectedChild');

      if (!selectedChild) {
        const res = await sqLiteClient.dB?.executeSql('select * from main.children order by id  limit 1');
        selectedChild = res && res[0].rows.item(0)?.id;

        if (!selectedChild) {
          throw new Error('There are no children');
        }

        await Storage.setItem('selectedChild', `${selectedChild}`);
      }

      const result = await sqLiteClient.dB?.executeSql('select * from children where id=?', [selectedChild]);

      if (!result || result[0].rows.length === 0) {
        throw Error('Not found');
      }

      const child = (result && result[0].rows.item(0)) || {};

      return {
        ...child,
        birthday: parseISO(child.birthday),
      };
    },
    {
      cacheTime: 0,
      staleTime: 0,
    },
  );
}

export function useSetSelectedChild() {
  return useMutation<void, {id: number}>(async ({id}) => {
    await Storage.setItem('selectedChild', `${id}`);
    await queryCache.refetchQueries(['selectedChild']);
  });
}

export function useUpdateChild() {
  return useMutation<void, ChildResult>(
    async (variables) => {
      const [query, values] = objectToQuery(
        {
          ...variables,
          birthday: formatISO(variables.birthday, {
            representation: 'date',
          }),
        },
        'children',
        'updateById',
      );
      await sqLiteClient.dB?.executeSql(query, values);
    },
    {
      onSuccess: (redult, variables) => {
        queryCache.refetchQueries('selectedChild');
        queryCache.refetchQueries('children');
        queryCache.refetchQueries(['children', {id: variables.id}]);
      },
    },
  );
}

export function useDeleteChild() {
  return useMutation<void, {id: number}>(
    async (variables) => {
      const selectedChild = await Storage.getItem('selectedChild');
      if (selectedChild === `${variables.id}`) {
        await Storage.removeItem('selectedChild');
      }
      await sqLiteClient.dB?.executeSql('delete from children where id = ?', [variables.id]);
    },
    {
      onSuccess: (redult, variables) => {
        queryCache.refetchQueries('selectedChild');
        queryCache.refetchQueries('children');
        queryCache.refetchQueries(['children', {id: variables.id}]);
      },
    },
  );
}

export function useGetChild(options: {id: number | string | undefined}) {
  return useQuery<ChildResult | undefined, [Key, typeof options]>(['children', options], async (key, variables) => {
    if (!variables.id) {
      return;
    }

    const result = await sqLiteClient.dB?.executeSql('select * from children where id = ?', [variables.id]);
    const record: ChildDbRecord = result && result[0].rows.item(0);
    return {
      ...record,
      birthday: parseISO(record.birthday),
    };
  });
}

export function useGetChildren() {
  return useQuery<ChildResult[], Key>('children', async () => {
    const result = await sqLiteClient.dB?.executeSql('select * from children');
    const records: ChildDbRecord[] = (result && result[0].rows.raw()) || [];
    return records.map((value) => ({
      ...value,
      birthday: parseISO(value.birthday),
    }));
  });
}

export function useAddChild() {
  return useMutation<void, Omit<ChildResult, 'id'>>(
    async (variables) => {
      const [query, values] = objectToQuery(
        {
          ...variables,
          birthday: formatISO(variables.birthday, {
            representation: 'date',
          }),
        },
        'children',
      );
      const res = await sqLiteClient.dB?.executeSql(query, values);

      const [{insertId}] = res || [{}];
      insertId && Storage.setItem('selectedChild', `${insertId}`);

      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0) {
        throw new Error('Add child failed');
      }
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('selectedChild');
        queryCache.refetchQueries(['children']);
      },
    },
  );
}
