import {useQuery} from 'react-query';

import {getChildById} from '../../db/childQueries';
import {useGetCurrentChildId} from './useGetCurrentChildId';

export function useGetCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  return useQuery(
    ['selectedChild', {id: selectedChildId}],
    async () => {
      // __DEV__ && (await slowdown(Promise.resolve(), 3000));
      return selectedChildId ? getChildById(selectedChildId) : undefined;
    },
    {
      enabled: Boolean(selectedChildId),
    },
  );
}
