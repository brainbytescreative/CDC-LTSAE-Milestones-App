import {queryCache, useMutation, useQuery} from 'react-query';
import Storage from '../utils/Storage';

export function useGetOnboarding() {
  return useQuery<boolean, string>('onboarding', () => {
    return Storage.getItem('onboarding').then((value) => JSON.parse(value || 'false'));
  });
}
export function useSetOnboarding() {
  return useMutation<void, boolean>((variables) => Storage.setItem('onboarding', JSON.stringify(variables)), {
    onSuccess: (data, variables) => {
      queryCache.setQueryData('onboarding', variables);
    },
  });
}
