import {useQuery} from 'react-query';

import {getChildById} from '../../db/childQueries';
import {useGetCurrentChildId} from './useGetCurrentChildId';

export function useGetCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  return useQuery(
    ['selectedChild', {id: selectedChildId}],
    async () => (selectedChildId ? getChildById(selectedChildId) : undefined),
    {
      enabled: Boolean(selectedChildId),
    },
  );
}
