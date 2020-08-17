import {useQuery} from 'react-query';

import {getChildById, getSelectedChildIdFallback} from '../../db/childQueries';
import {ChildResult} from '../types';
import {useGetCurrentChildId} from './useGetCurrentChildId';

export function useGetCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  return useQuery(
    ['selectedChild', {id: selectedChildId}],
    async () => {
      // __DEV__ && (await slowdown(Promise.resolve(), 3000));
      // return selectedChildId ? getChildById(selectedChildId) : undefined;
      console.log('<<<selectedChildId', selectedChildId);
      let child: ChildResult | undefined;
      try {
        child = await getChildById(selectedChildId!);
      } catch (e) {
        const childId = await getSelectedChildIdFallback();
        console.log(childId);
        // console.log(childId);
        // return getChildById(Number(childId));
      }
      return child;
    },
    {
      enabled: Boolean(selectedChildId),
    },
  );
}
