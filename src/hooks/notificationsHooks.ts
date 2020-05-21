import {useMutation, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {add, formatISO, parseISO} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {v4 as uuid} from 'uuid';
import {sqLiteClient} from '../db';

export enum NotificationCategory {
  Recommendation,
  Milestone,
  Appointment,
  TipsAndActivities,
}

export function useSetMilestoneNotification() {
  return useMutation<void, {}>(async (variables) => {
    console.log('lol');
  });
}

interface TipsAndActivitiesNotification {
  notificationId?: string;
  bodyKey: string;
  childId: number;
  milestoneId: number;
}

interface NotificationDB {
  notificationId: string;
  fireDateTimestamp: string;
  notificationRead: boolean;
  notificationCategoryType: NotificationCategory;
  childId?: number;
  milestoneId?: number;
  appointmentId?: number;
  bodyArguments?: string;
  bodyLocalizedKey?: string;
  titleLocalizedKey?: string;
}

interface NotificationResult extends Omit<NotificationDB, 'fireDateTimestamp'> {
  fireDateTimestamp: Date;
}

export function useSetTipsAndActivitiesNotification() {
  const {t} = useTranslation();

  return useMutation<void, TipsAndActivitiesNotification>(async ({notificationId, bodyKey, childId, milestoneId}) => {
    const identifier = notificationId || uuid();
    const bodyLocalizedKey = `milestones:${bodyKey}`;
    const titleLocalizedKey = 'notifications:tipsAndActivitiesTitle';
    const trigger = add(new Date(), {seconds: 5});

    await sqLiteClient.dB
      ?.executeSql(
        ` insert or
            replace
            into notifications
            (notificationId,
             fireDateTimestamp,
             notificationCategoryType,
             childId,
             milestoneId,
             bodyLocalizedKey,
             titleLocalizedKey)
            values (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
        [
          identifier,
          formatISO(trigger),
          NotificationCategory.TipsAndActivities,
          childId,
          milestoneId,
          bodyLocalizedKey,
          titleLocalizedKey,
        ],
      )
      .catch(console.log);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: t(titleLocalizedKey),
        body: t(bodyLocalizedKey),
        sound: true,
      },
      trigger,
    });
  });
}

export function useGetUnreadNotifications() {
  return useQuery(
    'unreadNotifications',
    async () => {
      const result = await sqLiteClient.dB?.executeSql(
        `
        select *
        from notifications
        where fireDateTimestamp < ?1
          and notificationRead = false
    `,
        [formatISO(new Date())],
      );

      const unreadNotifications: NotificationResult[] | undefined =
        result &&
        result[0].rows.raw().map((value: NotificationDB) => ({
          ...value,
          fireDateTimestamp: parseISO(value.fireDateTimestamp),
        }));
      return unreadNotifications;
    },
    {
      suspense: false,
    },
  );
}
