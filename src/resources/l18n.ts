import i18next from 'i18next';
import {useCallback} from 'react';
import {initReactI18next} from 'react-i18next';
import {NativeModules, Platform} from 'react-native';
import {queryCache} from 'react-query';

import Storage from '../utils/Storage';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import milestonesTextsEN from './milestones/en-texts.json';
import milestonesEN from './milestones/en.json';
import milestonesTextsES from './milestones/es-texts.json';
import milestonesES from './milestones/es.json';

export const deviceLocale =
  (Platform.select({
    ios: () =>
      NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0],
    android: () => NativeModules.I18nManager.localeIdentifier,
  }) as () => string | undefined)?.()?.slice(0, 2) || 'en';

export function useChangeLanguage() {
  return useCallback((lang) => {
    i18next.changeLanguage(lang);
    queryCache.invalidateQueries(
      (query) => {
        const [key] = query.queryKey;
        return ['questions', 'concerns', 'tips', 'milestone'].includes(String(key));
      },
      {refetchActive: true},
    );
    Storage.setItemTyped('language', lang);
  }, []);
}

const languageDetector = {
  init: Function.prototype,
  type: 'languageDetector',
  async: true,
  detect: (callback: (language: string) => void) => {
    return Storage.getItemTyped('language').then((language) => {
      if (!language && ['en', 'es'].includes(deviceLocale)) {
        callback(deviceLocale);
      } else {
        callback(language ?? 'en');
      }
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector as any)
  .use(initReactI18next)
  // .use(backend)
  .init({
    // fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        ...translationEN,
        milestones: {...milestonesEN, ...milestonesTextsEN},
      },
      es: {...translationES, milestones: {...milestonesES, ...milestonesTextsES}},
    },
  });

export default i18next;
