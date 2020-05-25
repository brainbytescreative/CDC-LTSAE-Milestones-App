import {queryCache, useMutation, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {NotificationRequestInput} from 'expo-notifications';
import {add, differenceInMonths, formatISO, parseISO} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {v4 as uuid} from 'uuid';
import {sqLiteClient} from '../db';
import {ChildResult} from './childrenHooks';
import {formattedAge, tOpt} from '../utils/helpers';
import {childAges} from '../resources/constants';
import {TFunction} from 'i18next';
import {getNotificationSettings, NotificationsSettingType} from './settingsHooks';
import {InteractionManager} from 'react-native';

interface TipsAndActivitiesNotification {
  notificationId?: string;
  bodyKey: string;
  childId: number;
  milestoneId: number;
}

export interface NotificationDB {
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

interface MilestoneNotificationsPayload {
  child: ChildResult;
}

export enum NotificationCategory {
  Recommendation,
  Milestone,
  Appointment,
  TipsAndActivities,
}

export function useSetMilestoneNotifications() {
  return useMutation<void, MilestoneNotificationsPayload>(async (variables) => {
    const ageMonth = differenceInMonths(new Date(), variables.child.birthday);
    const remainingMilestones = childAges.map((value) => (value > (ageMonth || 0) ? value : -value));

    const queriesParams = remainingMilestones.map((value) => {
      return {
        notificationId: `milestone_age_${value}_child_${variables.child.id}`,
        fireDateTimestamp: formatISO(add(variables.child.birthday, {months: value})),
        notificationCategoryType: NotificationCategory.Milestone,
        childId: variables.child.id,
        milestoneId: value,
        bodyLocalizedKey: 'notifications:nextMilestoneNotificationBody',
        titleLocalizedKey: 'notifications:milestoneNotificationTitle',
        bodyArguments: {
          name: variables.child.name,
          gender: variables.child.gender,
        },
      };
    });

    await sqLiteClient.dB?.transaction((tx) => {
      queriesParams.forEach((value) => {
        tx.executeSql(
          ` insert or
              replace
              into notifications
              (notificationId,
               fireDateTimestamp,
               notificationCategoryType,
               childId,
               milestoneId,
               bodyLocalizedKey,
               titleLocalizedKey,
               bodyArguments,
               notificationRead)
              values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
                      coalesce(?9, (select notificationRead from main.notifications where notificationId = ?1)))`,
          [
            value.notificationId,
            value.fireDateTimestamp,
            value.notificationCategoryType,
            value.childId,
            value.milestoneId,
            value.bodyLocalizedKey,
            value.titleLocalizedKey,
            JSON.stringify(value.bodyArguments),
          ],
        );
      });
    });
  });
}

export function notificationDbToRequest(value: NotificationDB, t: TFunction): NotificationRequestInput | undefined {
  try {
    switch (value.notificationCategoryType) {
      case NotificationCategory.Recommendation:
        return undefined;
      case NotificationCategory.Milestone:
        const params: Record<string, string | number | undefined> =
          value.bodyArguments && JSON.parse(value.bodyArguments);
        const options = {
          name: params.name,
          childAgeFormatted: value.milestoneId && formattedAge(Math.abs(value.milestoneId), t).milestoneAgeFormatted,
          milestoneAgeFormatted:
            value.milestoneId && formattedAge(Math.abs(value.milestoneId), t, true).milestoneAgeFormatted,
          ...tOpt({t, gender: Number(params.gender)}),
        };
        return {
          identifier: value.notificationId,
          content: {
            body: value.bodyLocalizedKey && t(value.bodyLocalizedKey, options),
            title: value.titleLocalizedKey && t(value.titleLocalizedKey),
            sound: true,
          },
          trigger: parseISO(value.fireDateTimestamp),
        } as NotificationRequestInput;
      case NotificationCategory.Appointment:
        return undefined;
      case NotificationCategory.TipsAndActivities:
        return {
          identifier: value.notificationId,
          content: {
            body: value.bodyLocalizedKey && t(value.bodyLocalizedKey),
            title: value.titleLocalizedKey && t(value.titleLocalizedKey),
            sound: true,
          },
          trigger: parseISO(value.fireDateTimestamp),
        } as NotificationRequestInput;
      default: {
        return undefined;
      }
    }
  } catch (e) {
    return undefined;
  }
}

const sheduleNotifications = async (t: TFunction) => {
  InteractionManager.runAfterInteractions(async () => {
    const notificationSettings = await getNotificationSettings();

    const keys = Object.keys(notificationSettings) as (keyof NotificationsSettingType)[];
    const activeNotifications = keys.reduce((previousValue, currentValue) => {
      switch (currentValue) {
        case 'appointmentNotifications':
          if (notificationSettings[currentValue]) {
            return [...previousValue, NotificationCategory.Appointment];
          }
          break;
        case 'milestoneNotifications':
          if (notificationSettings[currentValue]) {
            return [...previousValue, NotificationCategory.Milestone];
          }
          break;
        case 'recommendationNotifications':
          if (notificationSettings[currentValue]) {
            return [...previousValue, NotificationCategory.Recommendation];
          }
          break;
        case 'tipsAndActivitiesNotification':
          if (notificationSettings[currentValue]) {
            return [...previousValue, NotificationCategory.TipsAndActivities];
          }
          break;
      }
      return previousValue;
    }, [] as NotificationCategory[]);

    const result = await sqLiteClient.dB?.executeSql(
      `select *
       from notifications
       where fireDateTimestamp > ?1
         and notificationRead = false
         and notificationCategoryType in (${activeNotifications.join(',')})
       order by fireDateTimestamp
       limit 60`,
      [formatISO(new Date())],
    );

    const records: NotificationDB[] = (result && result[0].rows.raw()) || [];

    const requests = records
      .map((value) => {
        return notificationDbToRequest(value, t);
      })
      .filter((value) => value !== undefined);

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Promise.all(requests.map((value) => value && Notifications.scheduleNotificationAsync(value)));
  });
};

export function useScheduleNotifications() {
  const {t} = useTranslation();

  return useMutation(() => {
    return sheduleNotifications(t);
  });
}

export function useSetTipsAndActivitiesNotification() {
  const {t} = useTranslation();

  return useMutation<void, TipsAndActivitiesNotification>(
    async ({notificationId, bodyKey, childId, milestoneId}) => {
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
    },
    {
      onSuccess: () => {
        sheduleNotifications(t);
      },
    },
  );
}

export function useCancelNotificationById() {
  return useMutation<void, {notificationId: string}>(
    async ({notificationId}) => {
      await sqLiteClient.dB?.executeSql('delete from notifications where notificationId =?1', [notificationId]);
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return;
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
      },
    },
  );
}

export function useSetNotificationRead() {
  return useMutation<void, {notificationId: string}>(
    async ({notificationId}) => {
      await sqLiteClient.dB?.executeSql('update notifications set notificationRead = true where notificationId =?1', [
        notificationId,
      ]);
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
      },
    },
  );
}

export function useGetUnreadNotifications() {
  return useQuery(
    'unreadNotifications',
    async () => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  select *
                  from notifications
                  where fireDateTimestamp <= ?1
                    and notificationRead = false
        `,
        [formatISO(new Date())],
      );
      const unreadNotifications: NotificationDB[] | undefined = result && result[0].rows.raw();
      //   .map((value: NotificationDB) => ({
      //   ...value,
      //   fireDateTimestamp: parseISO(value.fireDateTimestamp),
      // }));
      return unreadNotifications;
    },
    {
      suspense: false,
      staleTime: 0,
      refetchInterval: 30 * 1000,
    },
  );
}
