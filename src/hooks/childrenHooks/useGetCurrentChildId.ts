import {useQuery} from 'react-query';
import Storage from '../../utils/Storage';
import {sqLiteClient} from '../../db';

export function useGetCurrentChildId() {
  return useQuery('selectedChildId', async () => {
    let selectedChild = await Storage.getItemTyped('selectedChild');

    if (!selectedChild) {
      const res = await sqLiteClient.dB?.executeSql('select * from children order by id  limit 1');
      selectedChild = res && res[0].rows.item(0)?.id;

      if (!selectedChild) {
        // throw new Error('There are no children');
        return;
      }

      await Storage.setItemTyped('selectedChild', selectedChild);
    }

    return selectedChild;
  });
}
