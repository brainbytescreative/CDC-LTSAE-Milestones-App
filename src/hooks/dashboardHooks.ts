import {queryCache, useMutation, useQuery} from 'react-query';

import {useGetCurrentChildId} from './childrenHooks/useGetCurrentChildId';
import Storage from '../utils/Storage';

type QueryKeyDataArchiveButton = 'hideDataArchiveButton';
type QueryKeyChildIdsForHideDataArchiveButton = ['childIdsToHideDataArchiveButton', {currentChildId: number | null | undefined}];

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

export function useSetHideDataArchiveButtonForNewChild() {
  return useMutation<void, number | undefined>(
    async (variables) => {
      if (variables) {
        let clildrenIdsForHideButton = await Storage.getItemTyped('childIdsToHideDataArchiveButton');
        if ((clildrenIdsForHideButton?.length ?? 0 > 0) && clildrenIdsForHideButton?.includes(variables)) {
          return;
        }
        let newClildrenIdsForHideButton = [...(clildrenIdsForHideButton ?? [])];
        newClildrenIdsForHideButton.push(variables);
        await Storage.setItemTyped('childIdsToHideDataArchiveButton', newClildrenIdsForHideButton);
      }
    },
    {
      onSuccess: (data, variables) => {
        queryCache.setQueryData('childIdsToHideDataArchiveButton', variables);
      },
    },
  );
}

export function useGetHideDataArchiveButtonForCurrentChild() {
  const {data: selectedChildId} = useGetCurrentChildId();
  return useQuery<boolean | null, QueryKeyChildIdsForHideDataArchiveButton>(
          ['childIdsToHideDataArchiveButton', {currentChildId: selectedChildId}],
          async (key, variables) => {
            if (!variables.currentChildId) {
              return true;
            }
            let clildrenIdsForHideButton = await Storage.getItemTyped('childIdsToHideDataArchiveButton');
            return (clildrenIdsForHideButton ?? []).includes(variables.currentChildId);
          }
  );
}