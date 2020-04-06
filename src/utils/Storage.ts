import {AsyncStorage} from 'react-native';

type Key = 'selectedChild' | 'notificationSettings' | 'onboarding';

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

  static removeItem(key: Key, callback?: (error?: Error) => void): Promise<void> {
    return AsyncStorage.removeItem(key, callback);
  }

  static setItem(key: Key, value: string, callback?: (error?: Error) => void): Promise<void> {
    return AsyncStorage.setItem(key, value, callback);
  }
}
