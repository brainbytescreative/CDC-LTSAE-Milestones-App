import i18next from 'i18next';
import {useCallback} from 'react';
import {initReactI18next} from 'react-i18next';
import {queryCache} from 'react-query';

import Storage from '../utils/Storage';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import milestonesTextsEN from './milestones/en-texts.json';
import milestonesEN from './milestones/en.json';
import milestonesTextsES from './milestones/es-texts.json';
import milestonesES from './milestones/es.json';

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
      callback(language || 'en');
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  cacheUserLanguage: () => {},
};
//https://localise.biz/api/export/locale/en.json?index=id&format=i18next3&order=id&key=fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg

// class Backend implements BackendModule {
//   type: 'backend' = 'backend';
//
//   static resources: Record<string, any> = {
//     en: {
//       ...translationEN,
//       milestones: milestonesEN,
//     },
//     es: translationES,
//   };
//
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   create(languages: string[], namespace: string, key: string, fallbackValue: string): void {
//     console.log('create');
//   }
//
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   init(services: Services, backendOptions: Record<string, any | undefined>, i18nextOptions: InitOptions) {
//     console.log('init');
//   }
//
//   async read(language: string, namespace: string, callback: ReadCallback) {
//     const resourceElement = Backend.resources[language][namespace];
//     // console.log(!!resourceElement);
//     if (resourceElement) {
//       callback(null, resourceElement);
//     } else {
//       // console.log('<<err');
//       // callback(new Error('Translation error'), false);
//     }
//   }
//
//   // async readMulti(languages: string[], namespaces: string[], callback: ReadCallback) {
//   //   const lng = languages[0];
//   //   callback(null, Backend.resources);
//   //   console.log(lng);
//   //   const response = await axios.get(
//   //     `https://localise.biz/api/export/locale/${lng}.json?index=id&format=i18next3&fallback=en&order=id&key=fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg`,
//   //   );
//   // }
// }

// const backend = new Backend();

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
