import {queryCache, useMutation, useQuery} from 'react-query';

import Storage from '../utils/Storage';

type QueryKeyDataArchiveButton = 'hideDataArchiveButton';

export function useSetHideDataArchiveButton() {
  return useMutation<void, boolean | undefined>(
    async (variables) => {
      if (variables) {
        await Storage.setItemTyped('hideDataArchiveButton', variables);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryCache.setQueryData('hideDataArchiveButton', variables);
      },
    },
  );
}

export function useGetHideDataArchiveButton() {
  return useQuery<boolean | null, QueryKeyDataArchiveButton>('hideDataArchiveButton', async () => {
    return await Storage.getItemTyped('hideDataArchiveButton');
  });
}