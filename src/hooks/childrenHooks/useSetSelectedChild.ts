import {InteractionManager} from 'react-native';
import {queryCache, useMutation} from 'react-query';

import Storage from '../../utils/Storage';

export function useSetSelectedChild() {
  return useMutation<void, {id: number}>(
    async ({id}) => {
      // console.log(Date.now());
      setTimeout(async () => {
        await Storage.setItemTyped('selectedChild', id);
        await queryCache.setQueryData('selectedChildId', id);
        await queryCache.invalidateQueries('selectedChild');
      }, 0);
      InteractionManager.runAfterInteractions(async () => {
        // await Storage.setItem('selectedChild', `${id}`);
      });
    },
    {
      onSuccess: async () => {
        // await queryCache.setQueryData('selectedChild', id);
        // console.log(Date.now());
        // Promise.all([
        //   queryCache.invalidateQueries('selectedChild'),
        //   queryCache.invalidateQueries('questions'),
        //   queryCache.invalidateQueries('concerns'),
        //   queryCache.invalidateQueries('monthProgress'),
        //   queryCache.invalidateQueries('milestone'),
        // ]);
        // queryCache.clear();
      },
    },
  );
}
