// import milestoneChecklist from './milestoneChecklist.json!milestoneChecklist';

import {StackNavigationOptions} from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import i18next from 'i18next';
import _ from 'lodash';
import {Dimensions, Platform, StyleSheet} from 'react-native';

import {DashboardDrawerParamsList} from '../components/Navigator/types';

export const statesOnly = [
  'AL',
  'AK',
  'AS',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'VI',
  'WA',
  'WV',
  'WI',
  'WY',
];

export const states = Object.freeze<string[]>(['NonUs', ...statesOnly, 'other']);

export const statesOptions: Record<string, {label: string; value: string}[] | undefined> = {
  get en() {
    return states.map((val) => ({
      label: i18next.t(`states:${val}`, {lng: 'en'}),
      value: val,
    }));
  },
  get es() {
    return [
      ...[
        {label: i18next.t('states:NonUs', {lng: 'es'}), value: 'NonUs'},
        ..._.orderBy(
          statesOnly.map((val) => ({
            label: i18next.t(`states:${val}`, {lng: 'es'}),
            value: val,
          })),
          ['label'],
          ['asc'],
        ),
        {label: i18next.t('states:other', {lng: 'es'}), value: 'other'},
      ],
    ];
  },
};

export type StateCode = typeof states[number];

export interface ParentProfileSelectorValues {
  territory: string | undefined | null;
  guardian: string | undefined | null;
}

export type Guardian = typeof guardianTypes[number];

// export const guardianTypes = ['guardian', 'healthcareProvider'] as const;

export const guardianTypes = [
  'guardian',
  'headStartProvider',
  'teacher',
  'WICProvider',
  'homeVisitor',
  'healthcareProvider',
  'other',
] as const;

export enum WellChildCheckUpAppointmentAgesEnum {
  Age1 = 1,
  Age9 = 9,
  Age15 = 15,
  Age18 = 18,
  Age24 = 24,
  Age30 = 30,
}

export const suspenseEnabled = {shared: {suspense: true}};

export type SelectEventType =
  | 'Menu'
  | 'On'
  | 'Off'
  | 'Back'
  | 'Done'
  | 'Remind Me'
  | 'All'
  | 'Like'
  | 'Child Name Drop-down'
  | 'Notifications'
  | 'Audience Type: Skip'
  | 'Audience Type: Done'
  | 'Social'
  | 'Language'
  | 'Cognitive'
  | 'Movement'
  | 'When to Act Early'
  | 'My Child Summary'
  | 'Show Doctor'
  | 'Email Summary'
  | 'Delete'
  | 'Dashboard'
  | 'How to Use App'
  | 'Add Child'
  | 'Appointments'
  | 'Add Appointment'
  | 'Milestone Checklist'
  | 'Milestone Overview'
  | 'Notifications and Settings '
  | 'App Info & Privacy Policy'
  | 'Tips'
  | 'Previous Milestone Checklist Age'
  | 'Future Milestone Checklist Age'
  | 'Questions to Ask Doctor'
  | 'Notes/Concerns'
  | 'Doctor'
  | 'Date'
  | 'Time'
  | 'Appointment Type/Description'
  | 'Edit'
  | 'Edit Note'
  | 'Territory'
  | 'Next Checklist Notifications'
  | 'Appointment Notifications'
  | 'Recommendation Notifications'
  | 'Tips Notifications'
  | 'Children and Add Child'
  | 'Edit Answer'
  | 'Yes Premature'
  | 'No Premature'
  | 'View Checklist History';

export const skillTypes = ['social', 'language', 'cognitive', 'movement'] as const;
export type SkillType = typeof skillTypes[number];
export type Section = SkillType | 'actEarly';

export const sectionToEvent: Record<Section, SelectEventType | undefined> = {
  language: 'Language',
  actEarly: 'When to Act Early',
  cognitive: 'Cognitive',
  movement: 'Movement',
  social: 'Social',
};

export const drawerMenuToEvent: Record<keyof DashboardDrawerParamsList, SelectEventType | undefined> = {
  AddChildStub: 'Children and Add Child',
  ChildSummaryStack: 'My Child Summary',
  DashboardStack: 'Dashboard',
  InfoStack: 'App Info & Privacy Policy',
  MilestoneQuickViewStack: 'Milestone Overview',
  SettingsStack: 'Notifications and Settings ',
  TipsAndActivitiesStack: 'Tips',
  WhenToActEarly: 'When to Act Early',
  MilestoneChecklistStack: 'Milestone Checklist',
  AppointmentsStub: 'Appointments',
};

export const colors = Object.freeze({
  lightGreen: '#BCFDAC',
  darkGreen: '#9DF786',
  blueLink: '#0645AD',
  purple: '#CEB9EF',
  iceCold: '#94F5EB',
  aquamarine: '#64FCD4',
  lightGray: '#E3E3E3',
  gray: '#B9B9B9',
  darkGray: '#707070',
  black: '#000',
  tanHide: '#FC9554',
  apricot: '#EB7373',
  azalea: '#F2B1CA',
  yellow: '#FCFC9C',
  aquamarineTransparent: 'rgba(100, 252, 212, 0.28)',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
  white: 'rgba(255, 255, 255, 1)',
  sections: {
    social: '#EBDEFE',
    language: '#C9FFF0',
    cognitive: '#DBFFD2',
    movement: '#FFFECF',
    actEarly: '#FFC7C7',
  },
});

export const checklistSections: Readonly<(SkillType | 'actEarly')[]> = [...skillTypes, 'actEarly'];

export const sharedStyle = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: colors.gray,
  },
  screenTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 36,
  },
  boldText: {
    fontFamily: 'Montserrat-Bold',
  },
  required: {
    fontSize: 16,
  },
  errorOutline: {
    borderWidth: 2,
    borderColor: colors.apricot,
    borderRadius: 10,
    margin: -2,
  },
  largeBoldText: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
  },
  regularText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  midText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
  },
  midTextBold: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
});

export const breakStr = Dimensions.get('screen').width >= 375 ? '' : '\n';
export const breakStrBig = Dimensions.get('screen').width >= 414 ? '' : '\n';
export const breakStrLarge = Dimensions.get('screen').width >= 500 ? '' : '\n';

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type DeepWriteable<T> = {-readonly [P in keyof T]: DeepWriteable<T[P]>};

export const sharedScreenOptions: StackNavigationOptions = {
  headerStyle: {
    elevation: 0, // remove shadow on Android
    shadowOpacity: 0, // remove shadow on iOS
    backgroundColor: colors.iceCold,
  },
  headerTintColor: 'black',
  headerTitleAlign: 'center',
  headerBackTitle: ' ',
  headerTitleStyle: {
    ...sharedStyle.largeBoldText,
  },
};
export type MilestoneIdType = typeof milestonesIds[number];
export const milestonesIds = [2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60] as const;
export const milestonesIdsArchive = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60] as const;
// export const missingConcerns = [1, 7, 15, 25, 34, 42, 51, 58, 68, 80];
export const missingConcerns = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];
export const tooYongAgeDays = 42;
export type LanguageType = 'en' | 'es';

export const verticalImages: string[] = [
  // 'milestone_4_skill_29_photo_26',
  // 'milestone_9_skill_75_photo_55',
  // 'milestone_36_skill_188_photo_123',
  // 'milestone_48_skill_211_photo_131',
  // 'milestone_60_skill_236_photo_150',
  // 'milestone_60_skill_236_photo_151',
  // 'milestone_4_skill_20_photo_11',
  // 'milestone_24_skill_136_photo_85',
];

function replaceFile(path = '') {
  return Platform.OS === 'android' ? path.replace('file:///', 'file:/') : path;
}

const cacheDir = replaceFile(`${FileSystem.cacheDirectory ?? ''}ImagePicker/`);
const docDir = replaceFile(`${FileSystem.documentDirectory ?? ''}`);

export const pathToDB = async (path?: string | null) => {
  const destenation = path && path.replace(cacheDir, docDir);
  path && path.startsWith(cacheDir) && destenation && (await FileSystem.moveAsync({from: path, to: destenation}));
  return destenation?.replace(docDir, '');
};
export const pathFromDB = (path?: string | null) => {
  return path ? `${docDir ?? ''}${path}` : path;
};

// First, define a type that, when passed a union of keys, creates an object which
// cannot have those properties. I couldn't find a way to use this type directly,
// but it can be used with the below type.
export type Impossible<K extends keyof any> = {
  [P in K]: never;
};

// The secret sauce! Provide it the type that contains only the properties you want,
// and then a type that extends that type, based on what the caller provided
// using generics.
export type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

// This works, but I agree the type is pretty gross. But it might make it easier
// to see how this works.
//
// Whatever is passed to the function has to at least satisfy the Animal contract
// (the <T extends Animal> part), but then we intersect whatever type that is
// with an Impossible type which has only the keys on it that don't exist on Animal.
// The result is that the keys that don't exist on Animal have a type of `never`,
// so if they exist, they get flagged as an error!
// function thisWorks<T extends Animal>(animal: T & Impossible<Exclude<keyof T, keyof Animal>>): void {
//   console.log(`The noise that ${animal.name.toLowerCase()}s make is ${animal.noise}.`);
// }
//
// // This is the best I could reduce it to, using the NoExtraProperties<> type above.
// // Functions which use this technique will need to all follow this formula.
// function thisIsAsGoodAsICanGetIt<T extends Animal>(animal: NoExtraProperties<Animal, T>): void {
//   console.log(`The noise that ${animal.name.toLowerCase()}s make is ${animal.noise}.`);
// }
