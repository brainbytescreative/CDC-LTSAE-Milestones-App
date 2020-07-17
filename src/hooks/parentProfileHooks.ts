import {queryCache, useMutation, useQuery} from 'react-query';

import {ParentProfileSelectorValues} from '../resources/constants';
import Storage from '../utils/Storage';

type QueryKey = 'parentProfile';

export function useSetParentProfile() {
  return useMutation<void, ParentProfileSelectorValues | undefined>(
    async (variables) => {
      if (variables) {
        await Storage.setItemTyped('parentProfile', variables);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryCache.setQueryData('parentProfile', variables);
        // queryCache.invalidateQueries('parentProfile');
      },
    },
  );
}

export function useGetParentProfile() {
  return useQuery<ParentProfileSelectorValues | null | undefined, QueryKey>('parentProfile', async () => {
    const item = await Storage.getItem('parentProfile');
    let result;
    try {
      result = item && JSON.parse(item);
    } catch (e) {}
    return result;
  });
}
