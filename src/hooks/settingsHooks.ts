import {useMutation, useQuery} from 'react-query';
import Storage from '../utils/Storage';
import _ from 'lodash';

export type SettingName =
  | 'milestoneNotifications'
  | 'appointmentNotifications'
  | 'recommendationNotifications'
  | 'tipsAndActivitiesNotification';

export type NotificationSettings = Record<SettingName, boolean>;

export function useGetNotificationSettings() {
  return useQuery<NotificationSettings, string>('notificationSettings', () => {
    return Storage.getItem('notificationSettings').then((value) => {
      let parsed;
      try {
        parsed = JSON.parse(value || '{}');
      } catch (e) {
        console.log(e);
      }
      return _.defaults(parsed, {
        appointmentNotifications: true,
        milestoneNotifications: false,
        recommendationNotifications: true,
        tipsAndActivitiesNotification: true,
      });
    });
  });
}

export function useSetNotificationSettings() {
  return useMutation<void, NotificationSettings>((variables) =>
    Storage.setItem('notificationSettings', JSON.stringify(variables)),
  );
}
