import {queryCache, useMutation, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {NotificationRequestInput} from 'expo-notifications';
import {add, differenceInMonths, formatISO, parseISO, setHours, startOfDay, sub} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {v4 as uuid} from 'uuid';
import {sqLiteClient} from '../db';
import {ChildDbRecord, ChildResult, useSetSelectedChild} from './childrenHooks';
import {checkMissingMilestones, formattedAge, navStateForAppointmentID, tOpt} from '../utils/helpers';
import {milestonesIds, PropType, WellChildCheckUpAppointmentAgesEnum} from '../resources/constants';
import {TFunction} from 'i18next';
import {getNotificationSettings, NotificationsSettingType} from './settingsHooks';
import {InteractionManager} from 'react-native';
import _ from 'lodash';
import {Answer, MilestoneAnswer} from './types';
import {Appointment, AppointmentDb} from './appointmentsHooks';
import {getAppointmentById} from '../db/appoinmetQueries';
import {deleteNotificationsByAppointmentId, getNotificationById} from '../db/notificationQueries';
import {NavigationContainerRef} from '@react-navigation/core';
import {useCallback} from 'react';
import {useSetMilestoneAge} from './checklistHooks';

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
  childGender: string | null;
  childName: string | null;
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

interface RecommendationNotificationsPayload {
  child: Pick<ChildDbRecord, 'id'>;
  milestoneId: number;
  reschedule?: boolean;
}

interface WellCheckUpNotificationsPayload {
  child: Pick<ChildResult, 'id' | 'name' | 'birthday'>;
  reschedule?: boolean;
}

interface RecommendationNotificationsDeletePayload extends Omit<RecommendationNotificationsPayload, 'child'> {
  childId: PropType<ChildDbRecord, 'id'>;
}

export enum NotificationCategory {
  Recommendation = 0,
  Milestone = 1,
  // eslint-disable-next-line no-shadow
  Appointment = 2,
  TipsAndActivities = 3,
}

function at8AM(date: Date) {
  return setHours(startOfDay(date), 8);
}

/**
 * Trigger time getter functions
 * Reference: https://drive.google.com/file/d/1tuJZnAKl6izwD_qnVcan4leP_ZXmWkAx/view
 */

/**
 * №1. Fires on the child’s birthday 8am
 * @param years
 * @param birthday
 */
function getMilestoneOnBirthDayTrigger({years, birthday}: {birthday: Date; years: number}) {
  return at8AM(add(birthday, {years}));
}

/**
 * №2. Fires 2 weeks prior to the age for which a well-child check is recommended
 * 2, 4, 6, 9, 12, 18 months
 * 2, 3, 4, 5 years
 * @param milestoneId
 * @param birthday
 */
function getWellCheckUpTrigger({milestoneId, birthday}: {birthday: Date; milestoneId: number}) {
  const before2weeks = sub(add(birthday, {months: milestoneId}), {weeks: 2});
  return at8AM(before2weeks);
}

/**
 * №7. If Not Yet or Not Sure is checked, fires 1 week later to revisit the milestones
 */
function completeMilestoneReminderTrigger() {
  return formatISO(add(new Date(), {weeks: 1}));
}

/**
 * №10. Fires off a week after any “Remind Me” is selected on Tips page
 */
function tipsAndActivitiesTrigger() {
  return add(new Date(), {seconds: 5});
}

/**
 * №5. Fires the day before the appointment
 * @param appointmentDate
 */
function appointment1daysBeforeTrigger(appointmentDate: Date) {
  return add(appointmentDate, {days: 1});
}

/**
 * №6. Fires if more than 24 hours have passed after a not yet or Act Early item has been selected
 */
function recommendation24HoursPassed() {
  return add(new Date(), {hours: 24});
}

/**
 * №8. Fires if more than 2 weeks has passed after a not yet/ Act Early item has been selected
 */
function recommendation2weekPassed() {
  return add(new Date(), {weeks: 2});
}

/**
 * №9. Fires if more than 4 weeks have passed after a not yet/not sure/Act Early item has been selected
 */
function recommendation4weeksPassed() {
  return add(new Date(), {weeks: 4});
}

/**
 * №2-4
 *
 *
 * №2. Fires 2 weeks prior to the age for which a well-child check is recommended
 * 1, 15, 30 months
 *
 * №3. Fires for well-child check up with developmental screening
 * 9, 30 months
 *
 * №4. 18, 24 months
 *
 * @param birthday
 * @param value
 */
function wellCheckUpMilestoneReminder(birthday: Date, value: number) {
  return at8AM(add(birthday, {months: value}));
}

export function useSetMilestoneNotifications() {
  const [reschedule] = useScheduleNotifications();
  const [setWellChildCheckUpAppointments] = useSetWellChildCheckUpAppointments();

  return useMutation<void, MilestoneNotificationsPayload>(
    async (variables) => {
      const years = Array.from(new Array(5)).map((value, index) => index);
      const queriesParams = years.map((value) => {
        const milestoneId = value ? value * 12 : milestonesIds[0];
        const at8am = getMilestoneOnBirthDayTrigger({birthday: variables.child.birthday, years: value});
        return {
          notificationId: `milestone_birthday_${value}_years_child_${variables.child.id}`,
          fireDateTimestamp: formatISO(at8am),
          notificationCategoryType: NotificationCategory.Milestone,
          childId: variables.child.id,
          milestoneId,
          bodyLocalizedKey: 'notifications:nextMilestoneBirthdayNotificationBody',
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
      onSuccess: async (data, {child}) => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
        await setWellChildCheckUpAppointments({child, reschedule: false});
        reschedule();
      },
    },
  );
}

export function useSetCompleteMilestoneReminder() {
  const [reschedule] = useScheduleNotifications();
  const [setRecommendationNotifications] = useSetRecommendationNotifications();
  const [deleteRecommendationNotifications] = useDeleteRecommendationNotifications();

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
            await deleteRecommendationNotifications({milestoneId, childId, reschedule: false});

            return reschedule();
          }
        } else if (
          (prevAnswer === Answer.YES || prevAnswer === undefined) &&
          (answer === Answer.NOT_YET || answer === Answer.UNSURE)
        ) {
          const twoWeeksLater = completeMilestoneReminderTrigger();
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

          await setRecommendationNotifications({
            reschedule: false,
            child: {id: childId},
            milestoneId,
          });

          return reschedule();
        }
      });
    },
  );
}

export function notificationDbToRequest(value: NotificationDB, t: TFunction): NotificationRequestInput | undefined {
  try {
    switch (value.notificationCategoryType) {
      case NotificationCategory.Milestone:
      case NotificationCategory.Appointment:
      case NotificationCategory.Recommendation: {
        const options = {
          name: value.childName,
          childAgeFormatted: value.milestoneId && formattedAge(value.milestoneId, t).milestoneAgeFormatted,
          milestoneAgeFormatted: value.milestoneId && formattedAge(value.milestoneId, t, true).milestoneAgeFormatted,
          milestoneAgeFormattedDashed:
            value.milestoneId && formattedAge(value.milestoneId, t, true).milestoneAgeFormattedDashes,
          ...tOpt({t, gender: Number(value.childGender)}),
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
      `
      SELECT *, ch.gender 'childGender', ch.name 'childName'
       FROM notifications
      LEFT JOIN children ch ON ch.id = notifications.childId
       WHERE fireDateTimestamp > ?1
         AND notificationRead <> 1   
         AND notificationCategoryType IN (${activeNotifications.join(',')})
       ORDER BY fireDateTimestamp
       LIMIT 60
       `,
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
    async ({notificationId, childId, milestoneId}) => {
      const identifier = notificationId || uuid();
      const bodyLocalizedKey = 'notifications:tipsAndActivitiesBody';
      const titleLocalizedKey = 'notifications:tipsAndActivitiesTitle';
      const trigger = tipsAndActivitiesTrigger();

      await sqLiteClient.dB
        ?.executeSql(
          `
                    INSERT OR
                    REPLACE
                    INTO notifications
                    (notificationId,
                     fireDateTimestamp,
                     notificationCategoryType,
                     childId,
                     milestoneId,
                     bodyLocalizedKey,
                     titleLocalizedKey)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
          `,
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
      await sqLiteClient.dB?.executeSql(
        `
                  DELETE
                  FROM notifications
                  WHERE notifications.childId = ?1
        `,
        [childId],
      );
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
                  SELECT *
                  FROM notifications
                  WHERE fireDateTimestamp <= ?1
                    AND notificationRead <> 1
                  ORDER BY fireDateTimestamp DESC
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
      suspense: true,
      staleTime: 0,
      refetchInterval: 10 * 1000,
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
        fireDateTimestamp: appointment1daysBeforeTrigger(appointmentDate),
        body: 'notifications:appointment1DayBeforeBody',
      },
      // {
      //   notificationId: `appointment_morning_${appointmentResult.id}`,
      //   fireDateTimestamp: appointmentMorningTrigger(appointmentDate),
      //   body: 'notifications:appointmentMorningBody',
      // },
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

export function useSetRecommendationNotifications() {
  const {t} = useTranslation();
  return useMutation<void, RecommendationNotificationsPayload>(async ({child, milestoneId, reschedule}) => {
    const series = [
      {
        notificationId: `recommendation_1day_passed_${child.id}_${milestoneId}`,
        fireDateTimestamp: recommendation24HoursPassed(),
        body: 'notifications:recommendation1DayPassedBody',
      },
      {
        notificationId: `recommendation_1week_passed_${child.id}_${milestoneId}`,
        fireDateTimestamp: recommendation2weekPassed(),
        body: 'notifications:recommendation1weekPassedBody',
      },
      {
        notificationId: `recommendation_4weeks_passed_${child.id}_${milestoneId}`,
        fireDateTimestamp: recommendation4weeksPassed(),
        body: 'notifications:recommendation4weeksPassedBody',
      },
    ];

    await sqLiteClient.dB?.transaction((tx) => {
      series.forEach(({notificationId, fireDateTimestamp, body}) => {
        tx.executeSql(
          ` INSERT OR
              REPLACE
              INTO notifications
              (notificationId,
               fireDateTimestamp,
               notificationCategoryType,
               childId,
               milestoneId,
               bodyLocalizedKey,
               titleLocalizedKey,
               notificationRead)
              VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7,
                      coalesce(?8, (SELECT notificationRead FROM notifications WHERE notificationId = ?1)))`,
          [
            notificationId,
            formatISO(fireDateTimestamp),
            NotificationCategory.Recommendation,
            child.id,
            milestoneId,
            body,
            'notifications:recommendationNotificationTitle',
          ],
        );
      });
    });

    (reschedule === undefined || reschedule) && (await scheduleNotifications(t));
  });
}

export function useDeleteRecommendationNotifications() {
  const {t} = useTranslation();
  return useMutation<void, RecommendationNotificationsDeletePayload>(async ({childId, milestoneId, reschedule}) => {
    await sqLiteClient.dB?.executeSql(
      `
          DELETE
          FROM notifications
          WHERE notificationCategoryType = ?1
            AND childId = ?2
            AND milestoneId = ?3
      `,
      [NotificationCategory.Recommendation, childId, milestoneId],
    );

    (reschedule === undefined || reschedule) && (await scheduleNotifications(t));
  });
}

function futureAges(ages: number[], ageMonth: number) {
  return ages.map((value) => (value > (ageMonth || 0) ? value : -value));
}

export function useSetWellChildCheckUpAppointments() {
  const {t} = useTranslation();
  return useMutation<void, WellCheckUpNotificationsPayload>(
    async ({child, reschedule}) => {
      const ageMonth = differenceInMonths(new Date(), child.birthday);
      const noChecklistMonths = futureAges(
        [
          WellChildCheckUpAppointmentAgesEnum.Age1,
          WellChildCheckUpAppointmentAgesEnum.Age15,
          WellChildCheckUpAppointmentAgesEnum.Age30,
        ],
        ageMonth,
      );

      const noCheckListData = noChecklistMonths.map((value) => ({
        notificationId: `well_child_check_up_appointment_${child.id}_${Math.abs(value)}`,
        fireDateTimestamp: wellCheckUpMilestoneReminder(child.birthday, value),
        body: 'notifications:wellCheckUpNoChecklist',
        milestoneId: Math.abs(value),
      }));

      const screeningReminders1 = futureAges(
        [WellChildCheckUpAppointmentAgesEnum.Age9, WellChildCheckUpAppointmentAgesEnum.Age30],
        ageMonth,
      );

      const screeningReminders1Data = screeningReminders1.map((value) => ({
        notificationId: `well_child_check_up_appointment_${child.id}_${Math.abs(value)}`,
        fireDateTimestamp: wellCheckUpMilestoneReminder(child.birthday, value),
        body: 'notifications:wellCheckUpSR1',
        milestoneId: Math.abs(value),
      }));

      const screeningReminders2 = futureAges(
        [WellChildCheckUpAppointmentAgesEnum.Age18, WellChildCheckUpAppointmentAgesEnum.Age24],
        ageMonth,
      );

      const screeningReminders2Data = screeningReminders2.map((value) => ({
        notificationId: `well_child_check_up_appointment_${child.id}_${Math.abs(value)}`,
        fireDateTimestamp: wellCheckUpMilestoneReminder(child.birthday, value),
        body: 'notifications:wellCheckUpSR2',
        milestoneId: Math.abs(value),
      }));

      const remainingMilestones = futureAges([...milestonesIds], ageMonth);

      const before2WeeksData = remainingMilestones.map((value) => ({
        notificationId: `well_child_check_up_appointment_${child.id}_${Math.abs(value)}`,
        fireDateTimestamp: getWellCheckUpTrigger({milestoneId: value, birthday: child.birthday}),
        body: 'notifications:wellCheckUp5DaysAfterBirthday',
        milestoneId: null,
      }));

      const series = [...noCheckListData, ...screeningReminders1Data, ...screeningReminders2Data, ...before2WeeksData];

      await sqLiteClient.dB?.transaction((tx) => {
        series.forEach(({notificationId, fireDateTimestamp, body, milestoneId}) => {
          tx.executeSql(
            `INSERT OR
             REPLACE
             INTO notifications
             (notificationId,
              fireDateTimestamp,
              notificationCategoryType,
              childId,
              milestoneId,
              bodyLocalizedKey,
              titleLocalizedKey,
              bodyArguments,
              notificationRead)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8,
                     coalesce(?9, (SELECT notificationRead FROM notifications WHERE notificationId = ?1)))`,
            [
              notificationId,
              formatISO(fireDateTimestamp),
              NotificationCategory.Appointment,
              child.id,
              milestoneId,
              body,
              'notifications:appointmentNotificationTitle',
              JSON.stringify({name: child.name}),
            ],
          );
        });
      });

      (reschedule === undefined || reschedule) && (await scheduleNotifications(t));
    },
    {
      onSuccess: (data, {reschedule}) => {
        (reschedule === undefined || reschedule) && queryCache.refetchQueries('unreadNotifications', {force: true});
      },
    },
  );
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
  const [setSelectedChild] = useSetSelectedChild();
  const [setMilestoneAge] = useSetMilestoneAge();
  const navigateNotification = useCallback(
    async (notificationId: string, navigator: Pick<NavigationContainerRef, 'navigate' | 'reset'>) => {
      const notificationData = await getNotificationById(notificationId);
      switch (notificationData?.notificationCategoryType) {
        case NotificationCategory.Appointment: {
          if (notificationData?.appointmentId) {
            navigator?.reset(navStateForAppointmentID(notificationData?.appointmentId));
          } else {
            notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
            notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
            navigator.navigate('ChildSummaryStack');
          }
          break;
        }
        case NotificationCategory.TipsAndActivities: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
          navigator.navigate('TipsAndActivitiesStack');
          break;
        }
        case NotificationCategory.Milestone:
        case NotificationCategory.Recommendation: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
          navigator.navigate('ChildSummaryStack');
          break;
        }
      }

      return setNotificationRead({notificationId});
    },
    [setNotificationRead, setSelectedChild, setMilestoneAge],
  );

  return [navigateNotification];
}
