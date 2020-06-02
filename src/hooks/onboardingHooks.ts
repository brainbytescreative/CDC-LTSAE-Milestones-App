import {queryCache, useMutation, useQuery} from 'react-query';
import Storage from '../utils/Storage';
import {slowdown} from '../utils/helpers';

export function useGetOnboarding() {
  return useQuery<boolean, string>(
    'onboarding',
    () => {
      return slowdown(Storage.getItem('onboarding').then((value) => !!value && JSON.parse(value)));
    },
    {
      suspense: true,
    },
  );
}
export function useSetOnboarding() {
  return useMutation<void, boolean>((variables) => Storage.setItem('onboarding', JSON.stringify(variables)), {
    onSuccess: (data, variables) => {
      queryCache.setQueryData('onboarding', variables);
    },
  });
}
