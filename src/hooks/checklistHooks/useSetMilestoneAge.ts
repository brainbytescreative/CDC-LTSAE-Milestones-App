import {useTranslation} from 'react-i18next';
import {queryCache} from 'react-query';

import {calcChildAge, formattedAge} from '../../utils/helpers';
// noinspection ES6PreferShortImport
import {useGetCurrentChild} from '../childrenHooks/useGetCurrentChild';
import {MilestoneQueryKey, MilestoneQueryResult} from '../types';

function useSetMilestoneAge() {
  const {t} = useTranslation('common');
  const {data: child} = useGetCurrentChild();
  return [
    (age: number) => {
      const {milestoneAge: childAge} = calcChildAge(child?.birthday);
      const formatted = formattedAge(age, t);
      const data: MilestoneQueryResult = {
        milestoneAge: age,
        ...formatted,
        childAge,
        isTooYong: false,
        betweenCheckList: false,
      };

      const key: MilestoneQueryKey = ['milestone', {childBirthday: child?.birthday}];
      queryCache.setQueryData(key, data);
    },
  ];
}

export default useSetMilestoneAge;
