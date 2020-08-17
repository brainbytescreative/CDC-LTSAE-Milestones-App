import {useQuery} from 'react-query';

import {getChildById, getSelectedChildIdFallback} from '../../db/childQueries';
import {ChildResult} from '../types';
import {useGetCurrentChildId} from './useGetCurrentChildId';
import {useSetSelectedChild} from './useSetSelectedChild';

export function useGetCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  const [setSelectedChild] = useSetSelectedChild();
  return useQuery(
    ['selectedChild', {id: selectedChildId}],
    async () => {
      let child: ChildResult | undefined;
      try {
        child = await getChildById(selectedChildId!);
      } catch (e) {
        const childId = await getSelectedChildIdFallback();
        childId && setSelectedChild({id: childId});
        // child = await getChildById(childId!);
      }
      return child;
    },
    {
      enabled: Boolean(selectedChildId),
    },
  );
}
