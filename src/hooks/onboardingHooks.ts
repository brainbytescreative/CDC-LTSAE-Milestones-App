import {queryCache, useMutation, useQuery} from 'react-query';

import {slowdown} from '../utils/helpers';
import Storage from '../utils/Storage';

export function useGetOnboarding() {
  return useQuery<boolean, string>(
    'onboarding',
    () => {
      const promise = Storage.getItem('onboarding').then((value) => !!value && JSON.parse(value));
      // return slowdown(promise);

      // return slowdown(Promise.resolve(__DEV__ ? false : promise));
      return slowdown(Promise.resolve(promise));
    },
    {
      suspense: true,
    },
  );
}
export function useSetOnboarding() {
  return useMutation((variables: {finished: boolean}) => Storage.setItemTyped('onboarding', variables.finished), {
    onSuccess: (data, variables) => {
      queryCache.setQueryData('onboarding', variables);
    },
  });
}
