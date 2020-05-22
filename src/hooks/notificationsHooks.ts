import {queryCache, useMutation, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {add, differenceInDays, differenceInMonths, formatISO, parseISO} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {v4, v4 as uuid} from 'uuid';
import {sqLiteClient} from '../db';
import {ChildResult} from './childrenHooks';
import {calcChildAge, formatAge, formattedAge, tOpt} from '../utils/helpers';
import {childAges} from '../resources/constants';
import {NotificationRequestInput} from 'expo-notifications';
import {TFunction} from 'i18next';

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
  const {t} = useTranslation();
  return useMutation<void, MilestoneNotificationsPayload>(async (variables) => {
    const ageMonth = differenceInMonths(new Date(), variables.child.birthday);
    const remainingMilestones = childAges.filter((value) => value > (ageMonth || 0));

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

const sheduleNotifications = async (t: TFunction) => {
  const result = await sqLiteClient.dB?.executeSql(
    `select *
       from notifications
       where fireDateTimestamp > ?1
         and notificationRead = false
       order by fireDateTimestamp
       limit 60`,
    [formatISO(new Date())],
  );

  const records: NotificationDB[] = (result && result[0].rows.raw()) || [];

  const requests: (NotificationRequestInput | undefined)[] = records
    .map((value) => {
      try {
        switch (value.notificationCategoryType) {
          case NotificationCategory.Recommendation:
            return undefined;
          case NotificationCategory.Milestone:
            const params: Record<string, string | number | undefined> =
              value.bodyArguments && JSON.parse(value.bodyArguments);
            const options = {
              name: params.name,
              childAgeFormatted: value.milestoneId && formattedAge(value.milestoneId, t).milestoneAgeFormatted,
              milestoneAgeFormatted:
                value.milestoneId && formattedAge(value.milestoneId, t, true).milestoneAgeFormatted,
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
    })
    .filter((value) => value !== undefined);

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(requests.map((value) => value && Notifications.scheduleNotificationAsync(value)));

  return;
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
      staleTime: 0,
      refetchInterval: 60 * 1000,
    },
  );
}
