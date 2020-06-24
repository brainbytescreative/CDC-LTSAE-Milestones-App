import {queryCache, useMutation, useQuery} from 'react-query';
import Storage from '../utils/Storage';
import _ from 'lodash';

export type SettingName =
  | 'milestoneNotifications'
  | 'appointmentNotifications'
  | 'recommendationNotifications'
  | 'tipsAndActivitiesNotification';

export type NotificationSettings = Record<SettingName, boolean>;

export type NotificationsSettingType = {
  appointmentNotifications: boolean;
  milestoneNotifications: boolean;
  recommendationNotifications: boolean;
  tipsAndActivitiesNotification: boolean;
};

export const getNotificationSettings: () => Promise<NotificationsSettingType> = () => {
  return Storage.getItem('notificationSettings').then((value) => {
    let parsed;
    try {
      parsed = JSON.parse(value || '{}');
    } catch (e) {
      console.log(e);
    }
    const defaults = {
      appointmentNotifications: true,
      milestoneNotifications: true,
      recommendationNotifications: true,
      tipsAndActivitiesNotification: true,
    };
    return _.defaults<NotificationsSettingType, any>(parsed, defaults);
  });
};

export function useGetNotificationSettings() {
  return useQuery<NotificationSettings, string>('notificationSettings', getNotificationSettings);
}

export function useSetNotificationSettings() {
  return useMutation<void, NotificationSettings>(
    (variables) => Storage.setItem('notificationSettings', JSON.stringify(variables)),
    {
      onSuccess: () => {
        queryCache.refetchQueries('notificationSettings', {force: true});
      },
    },
  );
}
