import {queryCache, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {formatISO, parseISO} from 'date-fns';
import AsyncStorage from '@react-native-community/async-storage';

export interface ChildDbRecord {
  id: string;
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

function objectToQuery(
  object: any,
  tableName: TableNames,
  queryType: 'insert' = 'insert',
): [string, any[]] {
  const values = Object.values(object);
  const variables = Object.keys(object);

  switch (queryType) {
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
