import {queryCache, useMutation} from 'react-query';
import {InteractionManager} from 'react-native';
import Storage from '../../utils/Storage';

export function useSetSelectedChild() {
  return useMutation<void, {id: number; name?: string}>(
    async ({id}) => {
      // console.log(Date.now());
      setTimeout(() => {
        queryCache.setQueryData('selectedChildId', id);
        queryCache.invalidateQueries('selectedChild');
      }, 0);
      InteractionManager.runAfterInteractions(async () => {
        await Storage.setItemTyped('selectedChild', id);
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
