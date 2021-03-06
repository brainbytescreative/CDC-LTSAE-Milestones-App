import {useQuery} from 'react-query';

import {getSelectedChildIdFallback} from '../../db/childQueries';
import Storage from '../../utils/Storage';

export function useGetCurrentChildId() {
  return useQuery('selectedChildId', async () => {
    let selectedChild = await Storage.getItemTyped('selectedChild');

    if (!selectedChild) {
      const fallback = await getSelectedChildIdFallback();
      fallback && (await Storage.setItemTyped('selectedChild', fallback));
      selectedChild = fallback ?? null;
    }

    return selectedChild;
  });
}
