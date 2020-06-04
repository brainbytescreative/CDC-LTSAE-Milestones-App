import {sqLiteClient} from './index';
import {NotificationDB} from '../hooks/notificationsHooks';

export function getNotificationById(id: string) {
  const query = sqLiteClient.dB?.executeSql(
    `
              SELECT *
              FROM notifications
              WHERE notificationId = ?`,
    [id],
  );
  return query?.then((value) => value[0].rows.item(0) as NotificationDB);
}
