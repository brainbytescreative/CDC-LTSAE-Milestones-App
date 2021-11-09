import {queryCache, useMutation, useQuery} from 'react-query';

import Storage from '../utils/Storage';

type QueryKeyComingSoonPopUp = 'comingSoonPopUpSeen';

export function useSetComingSoonPopUpSeen() {
  return useMutation<void, boolean | undefined>(
    async (variables) => {
      if (variables) {
        await Storage.setItemTyped('comingSoonPopUpSeen', variables);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryCache.setQueryData('comingSoonPopUpSeen', variables);
        // queryCache.invalidateQueries('parentProfile');
      },
    },
  );
}

export function useGetComingSoonPopUpSeen() {
  return useQuery<boolean | null, QueryKeyComingSoonPopUp>('comingSoonPopUpSeen', async () => {
    return await Storage.getItemTyped('comingSoonPopUpSeen');
  });
}
