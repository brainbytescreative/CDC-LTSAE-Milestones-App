import {add, differenceInMonths, formatISO, isPast, parseISO, setHours, startOfDay, sub} from 'date-fns';
import * as Notifications from 'expo-notifications';
import {NotificationRequestInput} from 'expo-notifications';
import {TFunction} from 'i18next';
import _ from 'lodash';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {InteractionManager} from 'react-native';
import {queryCache, useMutation, useQuery} from 'react-query';
import {v4 as uuid} from 'uuid';

import {sqLiteClient} from '../../db';
import {getAppointmentById} from '../../db/appoinmetQueries';
import {deleteNotificationsByAppointmentId, getNotificationById} from '../../db/notificationQueries';
import {PropType, WellChildCheckUpAppointmentAgesEnum, milestonesIds} from '../../resources/constants';
import {currentScreen, trackEventByType, trackNotificationById} from '../../utils/analytics';
import {
  checkMissingMilestones,
  formattedAge,
  navStateForAppointmentID,
  navStateForAppointmentsList,
  tOpt,
} from '../../utils/helpers';
import useSetMilestoneAge from '../checklistHooks/useSetMilestoneAge';
import {ChildDbRecord} from '../childrenHooks';
// noinspection ES6PreferShortImport
import {useSetSelectedChild} from '../childrenHooks/useSetSelectedChild';
import {NotificationsSettingType, getNotificationSettings} from '../settingsHooks';
import {AppointmentDb, ChildResult, MilestoneAnswer} from '../types';

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

// interface NotificationResult extends Omit<NotificationDB, 'fireDateTimestamp'> {
//   fireDateTimestamp: Date;
// }

interface MilestoneNotificationsPayload {
  child: ChildResult;
}

interface AppointmentNotificationsPayload {
  // child: ChildResult;
  appointmentId: AppointmentDb['id'];
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
  Appointment = 2,
  TipsAndActivities = 3,
  WellCheckUp,
}

function at8AM(date: Date) {
  return setHours(startOfDay(date), 8);
}
function at8PM(date: Date) {
  return setHours(startOfDay(date), 20);
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
  const before2weeks = add(birthday, {months: milestoneId, weeks: -2});
  return at8PM(before2weeks);
}

/**
 * №7. If Not Yet or Not Sure is checked, fires 1 week later to revisit the milestones
 */
function completeMilestoneReminderTrigger() {
  const date = add(new Date(), {weeks: 1});
  return formatISO(at8PM(date));
}

/**
 * №10. Fires off a week after any “Remind Me” is selected on Tips page
 */
function tipsAndActivitiesTrigger(startDate?: Date) {
  // const date = add(startDate ?? new Date(), false ? {seconds: 10} : {weeks: 3});
  // return false ? date : at8AM(date);

  const date = add(startDate ?? new Date(), {weeks: 3});
  return at8AM(date);
}

/**
 * №5. Fires the day before the appointment
 * @param appointmentDate
 */
function appointment1daysBeforeTrigger(appointmentDate: Date) {
  const date = sub(appointmentDate, {days: 1});
  return at8AM(date);
}

/**
 * №6. Fires if more than 24 hours have passed after a not yet or Act Early item has been selected
 */
function recommendation24HoursPassed() {
  const date = add(new Date(), {hours: 24});
  return at8PM(date);
}

/**
 * №8. Fires if more than 2 weeks has passed after a not yet/ Act Early item has been selected
 */
function recommendation2weekPassed() {
  const date = add(new Date(), {weeks: 2});
  return at8PM(date);
}

/**
 * №9. Fires if more than 4 weeks have passed after a not yet/not sure/Act Early item has been selected
 */
function recommendation4weeksPassed() {
  const date = add(new Date(), {weeks: 4});
  return at8PM(date);
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

function trigerIsValid(date: Date) {
  return __DEV__ ? true : !isPast(date);
}

export function useSetMilestoneNotifications() {
  const [reschedule] = useScheduleNotifications();
  const [setWellChildCheckUpAppointments] = useSetWellChildCheckUpAppointments();

  return useMutation<void, MilestoneNotificationsPayload>(
    async (variables) => {
      const years = Array.from(new Array(5)).map((value, index) => index + 1);
      const queriesParams = years
        .map((value) => {
          const milestoneId = value * 12;
          const at8am = getMilestoneOnBirthDayTrigger({birthday: variables.child.birthday, years: value});
          if (!trigerIsValid(at8am)) {
            return undefined;
          }
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
        })
        .filter((v) => v !== undefined);

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
              value!.notificationId,
              value!.fireDateTimestamp,
              value!.notificationCategoryType,
              value!.childId,
              value!.milestoneId,
              value!.bodyLocalizedKey,
              value!.titleLocalizedKey,
              JSON.stringify(value!.bodyArguments),
            ],
          );
        });
      });
    },
    {
      onSuccess: async (data, {child}) => {
        await queryCache.invalidateQueries('unreadNotifications');
        await setWellChildCheckUpAppointments({child, reschedule: false});
        await reschedule();
      },
    },
  );
}

export function useSetCompleteMilestoneReminder() {
  const [reschedule] = useScheduleNotifications();
  const [setRecommendationNotifications] = useSetRecommendationNotifications();
  const [deleteRecommendationNotifications] = useDeleteRecommendationNotifications();

  return useMutation<void, NonNullable<Omit<MilestoneAnswer, 'note'>>>(async ({childId, milestoneId}) => {
    InteractionManager.runAfterInteractions(async () => {
      const notificationId = `milestone_reminder_${childId}_${milestoneId}`;
      // if (answer === Answer.YES && (prevAnswer === Answer.NOT_YET || prevAnswer === Answer.UNSURE)) {
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

        // FIXME early return
        return reschedule();
      }

      const [
        notificationsIsSetQuery,
      ] = await sqLiteClient.db.executeSql('SELECT notificationId FROM notifications WHERE notificationId=?1 LIMIT 1', [
        notificationId,
      ]);

      if (notificationsIsSetQuery.rows.length > 0) {
        return;
      }

      // } else if (
      //   (prevAnswer === Answer.YES || prevAnswer === undefined) &&
      //   (answer === Answer.NOT_YET || answer === Answer.UNSURE)
      // ) {
      const twoWeeksLater = completeMilestoneReminderTrigger();
      const childResult = await sqLiteClient.dB?.executeSql('SELECT name, gender FROM children WHERE id=?1', [childId]);
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
      // }
    });
  });
}

export function notificationDbToRequest(value: NotificationDB, t: TFunction): NotificationRequestInput | undefined {
  try {
    switch (value.notificationCategoryType) {
      case NotificationCategory.Milestone:
      case NotificationCategory.Appointment:
      case NotificationCategory.WellCheckUp:
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
            return [...previousValue, NotificationCategory.Appointment, NotificationCategory.WellCheckUp];
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
      INNER JOIN children ch ON ch.id = notifications.childId
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
      let trigger = tipsAndActivitiesTrigger();

      await Promise.all(
        // fixme become redundant
        Array.from(new Array(1)).map(async (value, index) => {
          trigger = index === 0 ? trigger : tipsAndActivitiesTrigger(trigger);
          const isoTriger = formatISO(trigger);
          console.log(isoTriger);
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
                `${identifier}`,
                isoTriger,
                NotificationCategory.TipsAndActivities,
                childId,
                milestoneId,
                bodyLocalizedKey,
                titleLocalizedKey,
              ],
            )
            .catch(console.log);
        }),
      );
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
        queryCache.invalidateQueries('unreadNotifications');
      },
    },
  );
}
export function useCancelTipsNotificationById() {
  const {t} = useTranslation();
  return useMutation<void, {notificationId: string}>(
    async ({notificationId}) => {
      await sqLiteClient.dB?.executeSql("DELETE FROM notifications WHERE notificationId LIKE ?1 || '%'", [
        notificationId,
      ]);
      return;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('unreadNotifications');
        scheduleNotifications(t);
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
        queryCache.invalidateQueries('unreadNotifications');
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
        queryCache.invalidateQueries('unreadNotifications');
        reschedule();
      },
    },
  );
}

export function useGetUnreadNotifications() {
  return useQuery<NotificationDB[] | undefined, string>(
    'unreadNotifications',
    async (): Promise<NotificationDB[] | undefined> => {
      const [result] = await sqLiteClient.db.executeSql(
        `
                  SELECT notifications.*, ch.gender 'childGender', ch.name 'childName'
                  FROM notifications
                           INNER JOIN children ch ON ch.id = childId
                  WHERE fireDateTimestamp <= ?1
                    AND notificationRead <> 1
                  ORDER BY fireDateTimestamp DESC
        `,
        [formatISO(new Date())],
      );

      return result.rows.raw();
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

      const noCheckListData = noChecklistMonths.map((value) => {
        const fireDateTimestamp = wellCheckUpMilestoneReminder(child.birthday, value);
        if (!trigerIsValid(fireDateTimestamp)) {
          return undefined;
        }
        return {
          notificationId: `well_child_check_up_no_checklist_${child.id}_${Math.abs(value)}`,
          fireDateTimestamp,
          body: 'notifications:wellCheckUpNoChecklist',
          milestoneId: Math.abs(value),
        };
      });

      const screeningReminders1 = futureAges(
        [WellChildCheckUpAppointmentAgesEnum.Age9, WellChildCheckUpAppointmentAgesEnum.Age30],
        ageMonth,
      );

      const screeningReminders1Data = screeningReminders1.map((value) => {
        const fireDateTimestamp = wellCheckUpMilestoneReminder(child.birthday, value);
        if (!trigerIsValid(fireDateTimestamp)) {
          return undefined;
        }
        return {
          notificationId: `well_child_check_up_sr1_${child.id}_${Math.abs(value)}`,
          fireDateTimestamp,
          body: 'notifications:wellCheckUpSR1',
          milestoneId: Math.abs(value),
        };
      });

      const screeningReminders2 = futureAges(
        [WellChildCheckUpAppointmentAgesEnum.Age18, WellChildCheckUpAppointmentAgesEnum.Age24],
        ageMonth,
      );

      const screeningReminders2Data = screeningReminders2.map((value) => {
        const fireDateTimestamp = wellCheckUpMilestoneReminder(child.birthday, value);
        if (!trigerIsValid(fireDateTimestamp)) {
          return undefined;
        }
        return {
          notificationId: `well_child_check_up_sr2_${child.id}_${Math.abs(value)}`,
          fireDateTimestamp,
          body: 'notifications:wellCheckUpSR2',
          milestoneId: Math.abs(value),
        };
      });

      const remainingMilestones = futureAges([...milestonesIds], ageMonth);

      const before2WeeksData = remainingMilestones.map((value) => {
        const fireDateTimestamp = getWellCheckUpTrigger({milestoneId: value, birthday: child.birthday});
        if (!trigerIsValid(fireDateTimestamp)) {
          return undefined;
        }
        return {
          notificationId: `well_child_check_up_5_days_after_birthday_${child.id}_${Math.abs(value)}`,
          fireDateTimestamp,
          body: 'notifications:wellCheckUp5DaysAfterBirthday',
          milestoneId: Math.abs(value),
        };
      });

      const series = [
        ...noCheckListData,
        ...screeningReminders1Data,
        ...screeningReminders2Data,
        ...before2WeeksData,
      ].filter((v) => v !== undefined);

      await sqLiteClient.dB?.transaction((tx) => {
        series.forEach((val) => {
          const {notificationId, fireDateTimestamp, body, milestoneId} = val!;
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
              NotificationCategory.WellCheckUp,
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
        (reschedule === undefined || reschedule) && queryCache.invalidateQueries('unreadNotifications');
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
    async (notificationId: string, markAsRead = true) => {
      const navigator = currentScreen.navigation?.current;

      const notificationData = await getNotificationById(notificationId);
      switch (notificationData?.notificationCategoryType) {
        case NotificationCategory.Appointment: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          if (notificationData?.appointmentId) {
            navigator?.reset(navStateForAppointmentID(notificationData?.appointmentId));
          }
          break;
        }
        case NotificationCategory.WellCheckUp: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          if ([1, 15, 30].includes(Number(notificationData.milestoneId))) {
            navigator?.reset(navStateForAppointmentsList);
          } else {
            notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
            navigator?.navigate('MilestoneChecklistStack');
          }

          break;
        }
        case NotificationCategory.TipsAndActivities: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
          // navigator.navigate('TipsAndActivitiesStack');
          navigator?.navigate('TipsAndActivitiesStack', {
            screen: 'TipsAndActivities',
            params: {
              notificationId: notificationData?.notificationId,
            },
          });
          break;
        }
        case NotificationCategory.Milestone: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
          navigator?.navigate('MilestoneChecklistStack');
          break;
        }
        case NotificationCategory.Recommendation: {
          notificationData?.childId && (await setSelectedChild({id: notificationData?.childId}));
          notificationData?.milestoneId && (await setMilestoneAge(notificationData.milestoneId));
          navigator?.navigate('ChildSummaryStack');
          break;
        }
      }
      trackNotificationById(notificationId);

      return markAsRead && setNotificationRead({notificationId});
    },
    [setNotificationRead, setSelectedChild, setMilestoneAge],
  );

  return [navigateNotification];
}
