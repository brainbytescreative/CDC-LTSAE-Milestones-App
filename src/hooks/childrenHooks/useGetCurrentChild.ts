import {add, differenceInYears} from 'date-fns';
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

      const yo = Number(child && differenceInYears(new Date(), child?.birthday) > 2);
      const weeksPremature = Number(child?.weeksPremature);

      if (child && weeksPremature >= 4 && yo) {
        return {
          ...child,
          birthday: add(child.birthday, {weeks: weeksPremature}),
          realBirthDay: child.birthday,
        };
      }

      return child;
    },
    {
      enabled: Boolean(selectedChildId),
    },
  );
}
