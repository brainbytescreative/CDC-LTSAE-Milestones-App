/* eslint-disable @typescript-eslint/no-explicit-any */
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import translationES from './locales/es.json';
import translationEN from './locales/en.json';
import milestonesEN from './milestones/en.json';
import AsyncStorage from '@react-native-community/async-storage';
import {useCallback} from 'react';
import {queryCache, useMutation, useQuery} from 'react-query';

const languageCode = 'Language';
type LangCode = 'en' | 'es' | undefined;

export const getLanguageCode = () => {
  return AsyncStorage.getItem(languageCode) as Promise<LangCode>;
};

export const setLanguageCode = (language: string) => {
  return AsyncStorage.setItem(languageCode, language);
};

export function useGetLanguageCode() {
  const {data} = useQuery<LangCode, any>(languageCode, getLanguageCode);
  return {
    data: data || 'en',
  };
}

export function useChangeLanguage() {
  const [mutate] = useMutation<void, any>(
    (variables) => {
      return setLanguageCode(variables);
    },
    {
      onSuccess: () => {
        return queryCache.refetchQueries([languageCode]);
      },
    },
  );

  return useCallback(
    (lang) => {
      i18next.changeLanguage(lang);
      return mutate(lang);
    },
    [mutate],
  );
}

const languageDetector = {
  init: Function.prototype,
  type: 'languageDetector',
  async: true,
  detect: (callback: (language: string) => void) => {
    return getLanguageCode().then((language) => {
      callback(language || 'en');
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en_US',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    resources: {
      en: {
        ...translationEN,
        milestones: milestonesEN,
      },
      es: translationES,
    },
  });

export default i18next;
