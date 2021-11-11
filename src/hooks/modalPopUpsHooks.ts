import {queryCache, useMutation, useQuery} from 'react-query';

import Storage from '../utils/Storage';

type QueryKeyComingSoonPopUp = 'comingSoonPopUpSeen';
type QueryKeyWhatHasChangedPopUp = 'whatHasChangedPopUpSeen';

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
      },
    },
  );
}

export function useGetComingSoonPopUpSeen() {
  return useQuery<boolean | null, QueryKeyComingSoonPopUp>('comingSoonPopUpSeen', async () => {
    return await Storage.getItemTyped('comingSoonPopUpSeen');
  });
}

export function useSetWhatHasChangedPopUpSeen() {
  return useMutation<void, boolean | undefined>(
    async (variables) => {
      if (variables) {
        await Storage.setItemTyped('whatHasChangedPopUpSeen', variables);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryCache.setQueryData('whatHasChangedPopUpSeen', variables);
      },
    },
  );
}

export function useGetWhatHasChangedPopUpSeen() {
  return useQuery<boolean | null, QueryKeyWhatHasChangedPopUp>('whatHasChangedPopUpSeen', async () => {
    return await Storage.getItemTyped('whatHasChangedPopUpSeen');
  });
}