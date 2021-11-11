import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

import {NotificationSettings} from '../hooks/settingsHooks';
import {ParentProfileSelectorValues} from '../resources/constants';

type Key = keyof StorageParsedValue;

export type StorageParsedValue = {
  migrationStatus: 'done' | 'error' | 'notRequired';
  selectedChild: number;
  notificationSettings: NotificationSettings;
  onboarding: boolean;
  parentProfile: ParentProfileSelectorValues;
  language: string;
  comingSoonPopUpSeen: boolean;
  whatHasChangedPopUpSeen: boolean;
};

export default class Storage {
  static clear(callback?: (error?: Error) => void): Promise<void> {
    return AsyncStorage.clear(callback);
  }

  static getAllKeys(callback?: (error?: Error, keys?: string[]) => void): Promise<string[]> {
    return AsyncStorage.getAllKeys(callback);
  }

  static getItem(key: Key, callback?: (error?: Error, result?: string) => void): Promise<string | null> {
    return AsyncStorage.getItem(key, callback);
  }

  static getItemTyped<T extends Key>(
    key: T,
    callback?: (error?: Error, result?: string) => void,
  ): Promise<StorageParsedValue[T] | null> {
    return AsyncStorage.getItem(key, callback)
      .then((value) => value && JSON.parse(value))
      .catch((e) => {
        crashlytics().recordError(e);
      });
  }

  static removeItem(key: Key, callback?: (error?: Error) => void): Promise<void> {
    return AsyncStorage.removeItem(key, callback);
  }

  static setItem(key: Key, value: string, callback?: (error?: Error) => void): Promise<void> {
    return AsyncStorage.setItem(key, value, callback);
  }

  static async setItemTyped<T extends Key>(
    key: T,
    value: StorageParsedValue[T],
    callback?: (error?: Error) => void,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value), callback);
    } catch (e) {
      crashlytics().recordError(e);
    }
  }
}
