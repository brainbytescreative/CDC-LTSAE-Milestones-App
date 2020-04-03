import {queryCache, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {formatISO, parseISO} from 'date-fns';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

interface Record {
  id: string;
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

type TableNames = 'children';
type QueryType = 'insert' | 'updateById';

function objectToQuery(
  object: any,
  tableName: TableNames,
  queryType: QueryType = 'insert',
): [string, any[]] {
  const values = Object.values(_.omit(object, ['id']));
  const variables = Object.keys(_.omit(object, ['id']));

  switch (queryType) {
    case 'updateById':
      return [
        `
          UPDATE ${tableName} set ${variables
          .map((value) => `${value} = ?`)
          .join(', ')} where id = ?`,
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

export function useGetCurrentChild() {
  return useQuery<ChildResult, any>('selectedChild', async () => {
    let selectedChild: string | null = await AsyncStorage.getItem(
      'selectedChild',
    );

    if (!selectedChild) {
      const res = await sqLiteClient.dB?.executeSql(
        'select * from main.children order by id  limit 1',
      );
      selectedChild = res && res[0].rows.item(0)?.id;

      if (!selectedChild) {
        throw new Error('There are no children');
      }

      await AsyncStorage.setItem('selectedChild', `${selectedChild}`);
    }

    const result = await sqLiteClient.dB?.executeSql(
      'select * from children where id=?',
      [selectedChild],
    );

    const child = (result && result[0].rows.item(0)) || {};
    return {
      ...child,
      birthday: parseISO(child.birthday),
    };
  });
}

export function useSetSelectedChild() {
  return useMutation<void, {id: string}>(async ({id}) => {
    await AsyncStorage.setItem('selectedChild', `${id}`);
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

export function useGetChild(options: {id: number | string | undefined}) {
  return useQuery<ChildResult | undefined, typeof options>(
    ['children', options],
    async (key, variables) => {
      if (!variables.id) {
        return;
      }

      const result = await sqLiteClient.dB?.executeSql(
        'select * from children where id = ?',
        [variables.id],
      );
      const record: ChildDbRecord = result && result[0].rows.item(0);
      return {
        ...record,
        birthday: parseISO(record.birthday),
      };
    },
  );
}

export function useGetChildren() {
  return useQuery<ChildResult[], any>('children', async () => {
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
      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0) {
        throw new Error('Add child failed');
      }
    },
    {
      onSuccess: () => {
        return queryCache.refetchQueries(['children']);
      },
    },
  );
}
