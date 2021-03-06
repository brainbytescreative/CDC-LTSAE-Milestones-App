import {formatISO, parseISO} from 'date-fns';
import _ from 'lodash';
import {MutateOptions, QueryOptions, queryCache, useMutation, useQuery} from 'react-query';

import {sqLiteClient} from '../../db';
import {pathFromDB, pathToDB} from '../../resources/constants';
import {childSchema, updateChildSchema} from '../../resources/validationSchemas';
import {trackInteractionByType} from '../../utils/analytics';
import {objectToQuery} from '../../utils/helpers';
import Storage from '../../utils/Storage';
import {useRemoveNotificationsByChildId, useSetMilestoneNotifications} from '../notificationsHooks';
import {ChildResult, Key} from '../types';
import {useGetChild} from './useGetChild';
import {useGetCurrentChild} from './useGetCurrentChild';
import {useGetCurrentChildId} from './useGetCurrentChildId';
import {useSetSelectedChild} from './useSetSelectedChild';

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
  photo?: string | undefined | null;
  isPremature?: boolean;
  weeksPremature?: number | null;
}

type ChildDbRecordNew = Omit<ChildDbRecord, 'id'>;

export function useUpdateChild() {
  const [setMilestoneNotifications] = useSetMilestoneNotifications();
  return useMutation<void, ChildResult>(
    async (variables) => {
      const validChild = await updateChildSchema.validate(variables, {stripUnknown: true});
      const photo = await pathToDB(validChild.photo);
      const [query, values] = objectToQuery<ChildDbRecord>(
        {
          ...validChild,
          name: _.upperFirst(_.trim(validChild.name)),
          photo: photo,
          birthday: formatISO(validChild.birthday, {
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
        queryCache.invalidateQueries('selectedChild');
        queryCache.invalidateQueries('children');
        queryCache.invalidateQueries(['children', {id: variables.id}]);
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
        queryCache.invalidateQueries('selectedChild');
        queryCache.invalidateQueries('children');
        removeNotificationsByChildId({childId: variables.id});
      },
    },
  );
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
    options ?? {},
  );
}

type AddChildResult = number | undefined;
type AddChildVariables = {data: Omit<ChildResult, 'id'>; isAnotherChild: boolean};

export function useAddChild(options?: MutateOptions<AddChildResult, AddChildVariables>) {
  const [setMilestoneNotifications] = useSetMilestoneNotifications();
  const [setSelectedChild] = useSetSelectedChild();
  return useMutation<AddChildResult, AddChildVariables>(
    async (variables) => {
      const validChild = await childSchema.validate(variables.data, {stripUnknown: true});
      const photo = await pathToDB(validChild.photo);
      const [query, values] = objectToQuery<ChildDbRecordNew>(
        {
          ...validChild,
          name: _.upperFirst(_.trim(validChild.name)),
          photo: photo,
          birthday: formatISO(validChild.birthday, {
            representation: 'date',
          }),
        },
        'children',
      );
      const res = await sqLiteClient.dB?.executeSql(query, values);
      const insertId = res?.[0].insertId;

      if (!variables.isAnotherChild && insertId) {
        await setSelectedChild({id: insertId});
      }

      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0) {
        throw new Error('Add child failed');
      }
      trackInteractionByType('Completed Add Child', {page: `Add child #${insertId}` as any});
      return insertId;
    },
    {
      onSuccess: (data, variables) => {
        // queryCache.invalidateQueries('selectedChild');
        // queryCache.setQueryData('selectedChild', data);
        queryCache.invalidateQueries(['children'], {refetchInactive: true});
        options?.onSuccess && options.onSuccess(data, variables);
        data && setMilestoneNotifications({child: {id: data, ...variables.data}});
      },
    },
  );
}

export {useGetCurrentChild, useGetCurrentChildId, useSetSelectedChild, useGetChild};
