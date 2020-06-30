import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

type Key = keyof ParsedValue;

interface ParsedValue {
  migrated: boolean;
  migrationFailed: boolean;
  selectedChild: number;
  notificationSettings: Record<string, any>;
  onboarding: boolean;
  parentProfile: string;
}

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
  ): Promise<ParsedValue[T] | null> {
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
    value: ParsedValue[T],
    callback?: (error?: Error) => void,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value), callback);
    } catch (e) {
      crashlytics().recordError(e);
    }
  }
}
