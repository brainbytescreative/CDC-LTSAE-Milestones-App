import {MutateOptions, queryCache, QueryOptions, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {formatISO, parseISO} from 'date-fns';
import Storage from '../utils/Storage';
import {objectToQuery} from '../utils/helpers';
import {useRemoveNotificationsByChildId, useSetMilestoneNotifications} from './notificationsHooks';
import {InteractionManager, Platform} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {ACPCore} from '@adobe/react-native-acpcore';

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

type ChildDbRecordNew = Omit<ChildDbRecord, 'id'>;

export interface ChildResult extends Omit<ChildDbRecord, 'birthday'> {
  birthday: Date;
}

type Key = 'children' | 'selectedChild';

export function useGetCurrentChildId() {
  return useQuery('selectedChildId', async () => {
    let selectedChild = await Storage.getItemTyped('selectedChild');

    if (!selectedChild) {
      const res = await sqLiteClient.dB?.executeSql('select * from children order by id  limit 1');
      selectedChild = res && res[0].rows.item(0)?.id;

      if (!selectedChild) {
        // throw new Error('There are no children');
        return;
      }

      await Storage.setItemTyped('selectedChild', selectedChild);
    }

    return selectedChild;
  });
}

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

export function useSetSelectedChild() {
  return useMutation<void, {id: number; name?: string}>(
    async ({id}) => {
      // console.log(Date.now());
      setTimeout(() => {
        queryCache.setQueryData('selectedChildId', id);
        queryCache.refetchQueries('selectedChild', {force: true});
      }, 0);
      InteractionManager.runAfterInteractions(async () => {
        await Storage.setItem('selectedChild', `${id}`);
      });
    },
    {
      onSuccess: async () => {
        // await queryCache.setQueryData('selectedChild', id);
        // console.log(Date.now());
        // Promise.all([
        //   queryCache.refetchQueries('selectedChild', {force: true}),
        //   queryCache.refetchQueries('questions', {force: true}),
        //   queryCache.refetchQueries('concerns', {force: true}),
        //   queryCache.refetchQueries('monthProgress', {force: true}),
        //   queryCache.refetchQueries('milestone', {force: true}),
        // ]);
        // queryCache.clear();
      },
    },
  );
}

export function useUpdateChild() {
  const [setMilestoneNotifications] = useSetMilestoneNotifications();
  return useMutation<void, ChildResult>(
    async (variables) => {
      const [query, values] = objectToQuery<ChildDbRecord>(
        {
          ...variables,
          photo: pathToDB(variables.photo),
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
        queryCache.refetchQueries('selectedChild', {force: true});
        queryCache.refetchQueries('children', {force: true});
        queryCache.refetchQueries(['children', {id: variables.id}], {force: true});
        setMilestoneNotifications({child: variables});
      },
    },
  );
}

export function useDeleteChild() {
  const [removeNotificationsByChildId] = useRemoveNotificationsByChildId();
  return useMutation<void, {id: number}>(
    async (variables) => {
      const selectedChild = await Storage.getItem('selectedChild');
      if (selectedChild === `${variables.id}`) {
        await Storage.removeItem('selectedChild');
      }
      await sqLiteClient.dB?.executeSql('delete from children where id = ?', [variables.id]);
    },
    {
      onSuccess: (data, variables) => {
        queryCache.refetchQueries('selectedChild', {force: true});
        queryCache.refetchQueries('children', {force: true});
        removeNotificationsByChildId({childId: variables.id});
      },
    },
  );
}

export function useGetChild(options: {id: number | string | undefined}) {
  return useQuery<ChildResult | undefined, [Key, typeof options]>(['children', options], async (key, variables) => {
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
  });
}

export function useGetChildren(options?: QueryOptions<ChildResult[]>) {
  return useQuery<ChildResult[], Key>(
    'children',
    async () => {
      const result = await sqLiteClient.dB?.executeSql('select * from children');
      const records: ChildDbRecord[] = (result && result[0].rows.raw()) || [];
      return records.map((value) => ({
        ...value,
        photo: pathFromDB(value.photo),
        birthday: parseISO(value.birthday),
      }));
    },
    options,
  );
}

type AddChildResult = number | undefined;
type AddChildVariables = {data: Omit<ChildResult, 'id'>; isAnotherChild: boolean};

const pathToDB = (path?: string) => {
  return path
    ? Platform.select({
        ios: path?.replace(FileSystem.documentDirectory || '', ''),
        default: path,
      })
    : path;
};

const pathFromDB = (path?: string) => {
  return path
    ? Platform.select({
        ios: `${FileSystem.documentDirectory || ''}${path}`,
        default: path,
      })
    : path;
};

export function useAddChild(options?: MutateOptions<AddChildResult, AddChildVariables>) {
  const [setMilestoneNotifications] = useSetMilestoneNotifications();
  return useMutation<AddChildResult, AddChildVariables>(
    async (variables) => {
      const [query, values] = objectToQuery<ChildDbRecordNew>(
        {
          ...variables.data,
          photo: pathToDB(variables.data.photo),
          birthday: formatISO(variables.data.birthday, {
            representation: 'date',
          }),
        },
        'children',
      );
      const res = await sqLiteClient.dB?.executeSql(query, values);
      const [{insertId}] = res || [{}];
      if (!variables.isAnotherChild) {
        insertId && Storage.setItem('selectedChild', `${insertId}`);
      }

      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0) {
        throw new Error('Add child failed');
      }
      return insertId;
    },
    {
      onSuccess: (data, variables) => {
        ACPCore.trackState(`Child added: ${JSON.stringify(variables)}`, {'gov.cdc.appname': 'CDC Health IQ'});
        queryCache.refetchQueries('selectedChild', {force: true});
        queryCache.refetchQueries(['children'], {force: true});
        options?.onSuccess && options.onSuccess(data, variables);
        data && setMilestoneNotifications({child: {id: data, ...variables.data}});
      },
    },
  );
}
