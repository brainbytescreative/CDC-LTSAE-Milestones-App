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

      const birthdate = child?.realBirthDay ?? child?.birthday ?? new Date();
      const yo = differenceInYears(new Date(), birthdate);
      const weeksPremature = Number(child?.weeksPremature);

      if (child && child.isPremature && weeksPremature >= 4 && yo < 2) {
        const correctedAgeDate = add(child.birthday, {weeks: weeksPremature});
        return {
          ...child,
          birthday: correctedAgeDate,
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
