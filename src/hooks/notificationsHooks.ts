import {queryCache, useMutation, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {NotificationRequestInput} from 'expo-notifications';
import {add, differenceInMonths, formatISO, parseISO, setHours, startOfDay, sub} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {v4 as uuid} from 'uuid';
import {sqLiteClient} from '../db';
import {ChildDbRecord, ChildResult} from './childrenHooks';
import {checkMissingMilestones, formattedAge, navStateForAppointmentID, tOpt} from '../utils/helpers';
import {childAges, PropType} from '../resources/constants';
import {TFunction} from 'i18next';
import {getNotificationSettings, NotificationsSettingType} from './settingsHooks';
import {InteractionManager} from 'react-native';
import _ from 'lodash';
import {Answer, MilestoneAnswer} from './types';
import {Appointment, AppointmentDb} from './appointmentsHooks';
import {getAppointmentById} from '../db/appoinmetQueries';
import {deleteNotificationsByAppointmentId, getNotificationById} from '../db/notificationQueries';
import {NavigationContainerRef} from '@react-navigation/core';
import {Ref, useCallback} from 'react';

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

interface AppointmentNotificationsPayload {
  // child: ChildResult;
  appointmentId: PropType<Appointment, 'id'>;
}

export enum NotificationCategory {
  Recommendation,
  Milestone,
  Appointment,
  TipsAndActivities,
}
// setHours(startOfDay(new Date()), 8)
export function useSetMilestoneNotifications() {
  const [reschedule] = useScheduleNotifications();
  return useMutation<void, MilestoneNotificationsPayload>(
    async (variables) => {
      const ageMonth = differenceInMonths(new Date(), variables.child.birthday);
      const remainingMilestones = childAges.map((value) => (value > (ageMonth || 0) ? value : -value));

      const queriesParams = remainingMilestones.map((value) => {
        const milestoneId = Math.abs(value);
        const before2weeks = sub(add(variables.child.birthday, {months: value}), {weeks: 2});
        const at8am = setHours(startOfDay(before2weeks), 8);
        return {
          notificationId: `milestone_age_${milestoneId}_child_${variables.child.id}`,
          fireDateTimestamp: formatISO(at8am),
          notificationCategoryType: NotificationCategory.Milestone,
          childId: variables.child.id,
          milestoneId,
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
                        coalesce(?9, (select notificationRead from notifications where notificationId = ?1)))`,
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
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
        reschedule();
      },
    },
  );
}

export function useSetCompleteMilestoneReminder() {
  const [reschedule] = useScheduleNotifications();
  return useMutation<void, NonNullable<Omit<MilestoneAnswer, 'note'>> & {prevAnswer?: Answer}>(
    async ({prevAnswer, answer, childId, milestoneId}) => {
      InteractionManager.runAfterInteractions(async () => {
        const notificationId = `milestone_reminder_${childId}_${milestoneId}`;

        if (answer === Answer.YES && (prevAnswer === Answer.NOT_YET || prevAnswer === Answer.UNSURE)) {
          const {isNotSure, isNotYet} = await checkMissingMilestones(milestoneId, childId);
          if (!isNotSure && !isNotYet) {
            await sqLiteClient.dB?.executeSql(
              `
                DELETE
                FROM notifications
                WHERE notificationId = ?1
            `,
              [notificationId],
            );
            return reschedule();
          }
        } else if (
          (prevAnswer === Answer.YES || prevAnswer === undefined) &&
          (answer === Answer.NOT_YET || answer === Answer.UNSURE)
        ) {
          const twoWeeksLater = formatISO(add(new Date(), {weeks: 2}));
          const childResult = await sqLiteClient.dB?.executeSql('SELECT name, gender FROM children WHERE id=?1', [
            childId,
          ]);
          const child: Pick<ChildDbRecord, 'name' | 'gender'> | undefined = _.first(childResult)?.rows.item(0);
          const bodyArguments = JSON.stringify({
            name: child?.name,
            gender: child?.gender,
          });
          const titleLocalizedKey = 'notifications:milestoneNotificationTitle';
          const bodyLocalizedKey = 'notifications:milestoneCompleteReminder';
          await sqLiteClient.dB?.executeSql(
            `
                      INSERT OR
                      REPLACE
                      INTO notifications (notificationId,
                                          fireDateTimestamp,
                                          notificationCategoryType,
                                          childId,
                                          milestoneId,
                                          bodyLocalizedKey,
                                          titleLocalizedKey,
                                          bodyArguments,
                                          notificationRead)
                      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            `,
            [
              notificationId,
              twoWeeksLater,
              NotificationCategory.Milestone,
              childId,
              milestoneId,
              bodyLocalizedKey,
              titleLocalizedKey,
              bodyArguments,
              false,
            ],
          );

          return reschedule();
        }
      });
    },
  );
}

export function notificationDbToRequest(value: NotificationDB, t: TFunction): NotificationRequestInput | undefined {
  try {
    switch (value.notificationCategoryType) {
      case NotificationCategory.Recommendation:
        return undefined;
      case NotificationCategory.Milestone:
      case NotificationCategory.Appointment: {
        const params: Record<string, string | number | undefined> =
          value.bodyArguments && JSON.parse(value.bodyArguments);
        const options = {
          name: params.name,
          childAgeFormatted: value.milestoneId && formattedAge(value.milestoneId, t).milestoneAgeFormatted,
          milestoneAgeFormatted: value.milestoneId && formattedAge(value.milestoneId, t, true).milestoneAgeFormatted,
          milestoneAgeFormattedDashed:
            value.milestoneId && formattedAge(value.milestoneId, t, true).milestoneAgeFormattedDashes,
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
      }
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

const scheduleNotifications = async (t: TFunction) => {
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

    // gets all notifications in future
    const result = await sqLiteClient.dB?.executeSql(
      `select *
       from notifications
       where fireDateTimestamp > ?1
         and notificationRead <> 1   
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
    return scheduleNotifications(t);
  });
}

export function useSetTipsAndActivitiesNotification() {
  const [reschedule] = useScheduleNotifications();

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
        reschedule();
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
      await sqLiteClient.dB?.executeSql('update notifications set notificationRead = 1 where notificationId =?1', [
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

export function useRemoveNotificationsByChildId() {
  const [reschedule] = useScheduleNotifications();
  return useMutation<void, {childId: number}>(
    async ({childId}) => {
      await sqLiteClient.dB?.executeSql('delete from notifications where notifications.childId=?1', [childId]);
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
        reschedule();
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
                    and notificationRead <> 1
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
      onSuccess: (data) => {
        Notifications.setBadgeCountAsync(data?.length || 0);
      },
    },
  );
}

export function useSetAppointmentNotifications() {
  const {t} = useTranslation();
  return useMutation<void, AppointmentNotificationsPayload>(async (variables) => {
    const appointmentResult = await getAppointmentById(variables.appointmentId);

    if (!appointmentResult) {
      return;
    }

    const appointmentDate = parseISO(appointmentResult.date);
    const series = [
      {
        notificationId: `appointment_2DaysBefore_${appointmentResult.id}`,
        fireDateTimestamp: add(appointmentDate, {seconds: -40}),
        body: 'notifications:appointment2DaysBeforeBody',
      },
      {
        notificationId: `appointment_morning_${appointmentResult.id}`,
        fireDateTimestamp: add(appointmentDate, {seconds: -20}),
        body: 'notifications:appointmentMorningBody',
      },
    ];

    const milestoneId = 0;

    await sqLiteClient.dB?.transaction((tx) => {
      series.forEach(({notificationId, fireDateTimestamp, body}) => {
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
                 appointmentId,
                 notificationRead
                 )
                values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9,
                        coalesce(?10, (select notificationRead from notifications where notificationId = ?1)))`,
          [
            notificationId,
            formatISO(fireDateTimestamp),
            NotificationCategory.Appointment,
            appointmentResult.childId,
            milestoneId,
            body,
            'notifications:appointmentNotificationTitle',
            JSON.stringify({name: appointmentResult.childName}),
            appointmentResult.id,
          ],
        );
      });
    });

    await scheduleNotifications(t);
  });
}

export function useDeleteNotificationsByAppointmentId() {
  const {t} = useTranslation();
  return useMutation<void, Pick<AppointmentDb, 'id'>>(async (variables) => {
    await deleteNotificationsByAppointmentId(variables.id);
    await scheduleNotifications(t);
  });
}

export function useNavigateNotification() {
  const [setNotificationRead] = useSetNotificationRead();
  const navigateNotification = useCallback(
    async (notificationId: string, navigator: NavigationContainerRef) => {
      const notificationData = await getNotificationById(notificationId);
      switch (notificationData?.notificationCategoryType) {
        case NotificationCategory.Appointment: {
          notificationData?.appointmentId &&
            navigator?.reset(navStateForAppointmentID(notificationData?.appointmentId));
        }
      }

      return setNotificationRead({notificationId});
    },
    [setNotificationRead],
  );

  return [navigateNotification];
}
