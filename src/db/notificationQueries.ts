import {sqLiteClient} from './index';
import {NotificationDB} from '../hooks/notificationsHooks';
import {PropType} from '../resources/constants';
import {AppointmentDb} from '../hooks/appointmentsHooks';

export async function getNotificationById(id: string): Promise<NotificationDB | undefined> {
  const query = sqLiteClient.dB?.executeSql(
    `
              SELECT *
              FROM notifications
              WHERE notificationId = ?`,
    [id],
  );
  return query?.then((value) => value[0].rows.item(0) as NotificationDB);
}

export async function deleteNotificationsByAppointmentId(
  id: PropType<AppointmentDb, 'id'>,
): Promise<{rowsAffected: number} | undefined> {
  return sqLiteClient.dB
    ?.executeSql(
      `
              DELETE
              FROM notifications
              WHERE appointmentId = ?1
    `,
      [id],
    )
    .then((value) => ({rowsAffected: value[0].rowsAffected}));
}
