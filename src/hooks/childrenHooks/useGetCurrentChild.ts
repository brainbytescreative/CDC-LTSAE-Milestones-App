import {useQuery} from 'react-query';
import {useGetCurrentChildId} from './useGetCurrentChildId';
import {getChildById} from '../../db/childQueries';

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
