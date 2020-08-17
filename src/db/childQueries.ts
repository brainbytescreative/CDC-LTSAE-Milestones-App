import {parseISO} from 'date-fns';

import {ChildDbRecord} from '../hooks/childrenHooks';
import {ChildResult} from '../hooks/types';
import {pathFromDB} from '../resources/constants';
import {sqLiteClient} from './index';

export async function getChildById(childId: ChildDbRecord['id']): Promise<ChildResult | undefined> {
  const result = await sqLiteClient.db.executeSql('select * from children where id=?1', [childId]);
  const child: ChildDbRecord | undefined = result[0].rows.item(0);

  if (!child) {
    return undefined;
  }

  return {
    ...child,
    photo: pathFromDB(child?.photo),
    birthday: child.birthday && parseISO(child.birthday),
  } as ChildResult;
}

export async function getSelectedChildIdFallback(): Promise<ChildDbRecord['id'] | undefined> {
  const res = await sqLiteClient.db.executeSql('select id from children order by id  limit 1');
  return res[0].rows.item(0)?.id;
}

export async function getChildrenCount() {
  const [res] = await sqLiteClient.db.executeSql('SELECT count(id) cnt FROM children');
  return __DEV__ ? 0 : Number(res.rows.item(0)?.['cnt']);
}
