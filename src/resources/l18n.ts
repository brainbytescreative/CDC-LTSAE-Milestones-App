import i18next, {BackendModule, ReadCallback} from 'i18next';
import {initReactI18next} from 'react-i18next';
import translationES from './locales/es.json';
import translationEN from './locales/en.json';
import milestonesEN from './milestones/en.json';
import AsyncStorage from '@react-native-community/async-storage';
import {useCallback} from 'react';
import {queryCache, useMutation, useQuery} from 'react-query';
import BackendAdapter from 'i18next-multiload-backend-adapter';
import axios from 'axios';

const languageCode = 'Language';
export type LangCode = 'en' | 'es' | undefined;

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
        return queryCache.refetchQueries([languageCode], {force: true});
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
//https://localise.biz/api/export/locale/en.json?index=id&format=i18next3&order=id&key=fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg

class Backend implements BackendModule {
  type: 'backend' = 'backend';
  static type = 'backend';

  static resources: Record<string, any> = {
    en: {
      ...translationEN,
      milestones: milestonesEN,
    },
    es: translationES,
  };

  create(languages: string[], namespace: string, key: string, fallbackValue: string): void {
    console.log(languages, namespace, key, fallbackValue);
  }

  init(): void {
    console.log('<READ');
  }

  async read(language: string, namespace: string, callback: ReadCallback) {
    console.log(namespace, language);
    callback(null, Backend.resources[language][namespace]);
  }

  // async readMulti(languages: string[], namespaces: string[], callback: ReadCallback) {
  //   const lng = languages[0];
  //   callback(null, Backend.resources);
  //   console.log(lng);
  //   const response = await axios.get(
  //     `https://localise.biz/api/export/locale/${lng}.json?index=id&format=i18next3&fallback=en&order=id&key=fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg`,
  //   );
  // }
}

i18next
  .use(languageDetector as any)
  .use(initReactI18next)
  .use(Backend)
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
        milestones: milestonesEN,
      },
      es: translationES,
    },
  });

export default i18next;
