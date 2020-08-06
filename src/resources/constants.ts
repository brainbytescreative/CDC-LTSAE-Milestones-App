// import milestoneChecklist from './milestoneChecklist.json!milestoneChecklist';

import {StackNavigationOptions} from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import {NotificationTriggerInput} from 'expo-notifications/src/Notifications.types';
import {Platform, StyleSheet} from 'react-native';

import {DashboardDrawerParamsList} from '../components/Navigator/types';

export const states = [
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
  'VI',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
] as const;

export type StateCode = typeof states[number];

export interface ParentProfileSelectorValues {
  territory: string | undefined | null;
  guardian: string | undefined | null;
}

export type Guardian = typeof guardianTypes[number];

export const guardianTypes = ['guardian', 'healthcareProvider'] as const;

// export const guardianTypes = [
//   'guardian',
//   // 'headStartProvider',
//   // 'teacher',
//   // 'WICProvider',
//   // 'homeVisitor',
//   'healthcareProvider',
//   // 'other',
// ];

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
  | 'Child Name Drop-down'
  | 'Notifications'
  | 'Social'
  | 'Language'
  | 'Cognitive'
  | 'Movement'
  | 'When to Act Early'
  | 'My Child Summary'
  | "Email Child's Summary"
  | 'Delete'
  | 'Dashboard'
  | 'How to Use App'
  | 'Add Child'
  | 'Appointments'
  | 'Add Appointment'
  | 'Milestone Checklist'
  | 'Milestone Quickview'
  | 'Notifications and Settings '
  | 'Privacy Policy and App'
  | 'Tips'
  | 'Previous Milestone Checklist Age'
  | 'Future Milestone Checklist Age'
  | 'Questions to Ask Doctor'
  | 'Notes/Concerns'
  | 'Doctor'
  | 'Date'
  | 'Appointment Type/Description'
  | 'Edit'
  | 'Edit Note'
  | 'Edit Answer';

export const skillTypes = ['social', 'language', 'cognitive', 'movement'] as const;
export type SkillType = typeof skillTypes[number];
export type Section = SkillType | 'actEarly';

export const sectionToEvent: Record<Section, SelectEventType> = {
  language: 'Language',
  actEarly: 'When to Act Early',
  cognitive: 'Cognitive',
  movement: 'Movement',
  social: 'Social',
};

export const drawerMenuToEvent: Record<keyof DashboardDrawerParamsList, SelectEventType | undefined> = {
  AddChildStub: 'Add Child',
  ChildSummaryStack: 'My Child Summary',
  DashboardStack: 'Dashboard',
  InfoStack: 'Privacy Policy and App',
  MilestoneQuickViewStack: 'Milestone Quickview',
  SettingsStack: 'Notifications and Settings ',
  TipsAndActivitiesStack: 'Tips',
  WhenToActEarly: 'When to Act Early',
  MilestoneChecklistStack: 'Milestone Checklist',
  AppointmentsStub: 'Appointments',
};

export const colors = Object.freeze({
  lightGreen: '#BCFDAC',
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
    textTransform: 'capitalize',
    marginHorizontal: 32,
    marginTop: 36,
  },
  boldText: {
    fontFamily: 'Montserrat-Bold',
  },
  required: {
    fontSize: 15,
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
export const milestonesIds = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60] as const;
export const missingConcerns = [1, 7, 15, 25, 34, 42, 51, 58, 68, 80];
export const tooYongAgeDays = 42;
export type LanguageType = 'en' | 'es';

export const notificationIntervals: Readonly<Record<string, NotificationTriggerInput>> = Object.freeze({
  tips: {
    seconds: 20, // todo 2 weeks
  },
});

export const images = {
  '20651': require('./images/20651.jpg'),
  '20652': require('./images/20652.jpg'),
  '20653': require('./images/20653.jpg'),
  '20654': require('./images/20654.jpg'),
  '20655': require('./images/20655.jpg'),
  '20656': require('./images/20656.jpg'),
  '20657': require('./images/20657.jpg'),
  '20658': require('./images/20658.jpg'),
  '20659': require('./images/20659.jpg'),
  '20660': require('./images/20660.jpg'),
  '20661': require('./images/20661.jpg'),
  '20662': require('./images/20662.jpg'),
  '20663': require('./images/20663.jpg'),
  '20664': require('./images/20664.jpg'),
  '20665': require('./images/20665.jpg'),
  '20666': require('./images/20666.jpg'),
  '20667': require('./images/20667.jpg'),
  '20668': require('./images/20668.jpg'),
  '20669': require('./images/20669.jpg'),
  '20670': require('./images/20670.jpg'),
  '20671': require('./images/20671.jpg'),
  '20672': require('./images/20672.jpg'),
  '20673': require('./images/20673.jpg'),
  '20674': require('./images/20674.jpg'),
  '20675': require('./images/20675.jpg'),
  '20676': require('./images/20676.jpg'),
  '20677': require('./images/20677.jpg'),
  '20678': require('./images/20678.jpg'),
  '20679': require('./images/20679.jpg'),
  '20680': require('./images/20680.jpg'),
  '20681': require('./images/20681.jpg'),
  '20682': require('./images/20682.jpg'),
  '20683': require('./images/20683.jpg'),
  '20684': require('./images/20684.jpg'),
  '20685': require('./images/20685.jpg'),
  '20686': require('./images/20686.jpg'),
  '20687': require('./images/20687.jpg'),
  '20688': require('./images/20688.jpg'),
  '20689': require('./images/20689.jpg'),
  '20690': require('./images/20690.jpg'),
  '20691': require('./images/20691.jpg'),
  '20693': require('./images/20693.jpg'),
  '20694': require('./images/20694.jpg'),
  '20695': require('./images/20695.jpg'),
  '20696': require('./images/20696.jpg'),
  '20697': require('./images/20697.jpg'),
  '20698': require('./images/20698.jpg'),
  '20699': require('./images/20699.jpg'),
  '20700': require('./images/20700.jpg'),
  '20701': require('./images/20701.jpg'),
  '20702': require('./images/20702.jpg'),
  '20703': require('./images/20703.jpg'),
  '20704': require('./images/20704.jpg'),
  '20705': require('./images/20705.jpg'),
  '20706': require('./images/20706.jpg'),
  '20707': require('./images/20707.jpg'),
  '20708': require('./images/20708.jpg'),
  '20709': require('./images/20709.jpg'),
  '20710': require('./images/20710.jpg'),
  '20711': require('./images/20711.jpg'),
  '20712': require('./images/20712.jpg'),
  '20713': require('./images/20713.jpg'),
  '20714': require('./images/20714.jpg'),
  '20715': require('./images/20715.jpg'),
  '20716': require('./images/20716.jpg'),
  '20717': require('./images/20717.jpg'),
  '20718': require('./images/20718.jpg'),
  '20719': require('./images/20719.jpg'),
  '20720': require('./images/20720.jpg'),
  '20721': require('./images/20721.jpg'),
  '20722': require('./images/20722.jpg'),
  '20723': require('./images/20723.jpg'),
  '20724': require('./images/20724.jpg'),
  '20725': require('./images/20725.jpg'),
  '20726': require('./images/20726.jpg'),
  '20727': require('./images/20727.jpg'),
  '20728': require('./images/20728.jpg'),
  '20729': require('./images/20729.jpg'),
  '20730': require('./images/20730.jpg'),
  '20731': require('./images/20731.jpg'),
  '20732': require('./images/20732.jpg'),
  '20733': require('./images/20733.jpg'),
  '20734': require('./images/20734.jpg'),
  '20735': require('./images/20735.jpg'),
  '20736': require('./images/20736.jpg'),
  '20737': require('./images/20737.jpg'),
  '20738': require('./images/20738.jpg'),
  '20739': require('./images/20739.jpg'),
  '20740': require('./images/20740.jpg'),
  '20741': require('./images/20741.jpg'),
  '20742': require('./images/20742.jpg'),
  '20743': require('./images/20743.jpg'),
  '20744': require('./images/20744.jpg'),
  '20745': require('./images/20745.jpg'),
  '20746': require('./images/20746.jpg'),
  '20747': require('./images/20747.jpg'),
  '20748': require('./images/20748.jpg'),
  '20749': require('./images/20749.jpg'),
  '20750': require('./images/20750.jpg'),
  '20751': require('./images/20751.jpg'),
  '20752': require('./images/20752.jpg'),
  '20753': require('./images/20753.jpg'),
  '20754': require('./images/20754.jpg'),
  '20755': require('./images/20755.jpg'),
  '20756': require('./images/20756.jpg'),
  '20757': require('./images/20757.jpg'),
  '20758': require('./images/20758.jpg'),
  '20759': require('./images/20759.jpg'),
  '20760': require('./images/20760.jpg'),
  '20761': require('./images/20761.jpg'),
  '20762': require('./images/20762.jpg'),
  '20763': require('./images/20763.jpg'),
  '20764': require('./images/20764.jpg'),
  '20765': require('./images/20765.jpg'),
  '20766': require('./images/20766.jpg'),
  '20767': require('./images/20767.jpg'),
  '20768': require('./images/20768.jpg'),
  '20769': require('./images/20769.jpg'),
  '20770': require('./images/20770.jpg'),
  '20771': require('./images/20771.jpg'),
  '20772': require('./images/20772.jpg'),
  '20773': require('./images/20773.jpg'),
  '20774': require('./images/20774.jpg'),
  '20775': require('./images/20775.jpg'),
  '20776': require('./images/20776.jpg'),
  '20777': require('./images/20777.jpg'),
  '20778': require('./images/20778.jpg'),
  '20779': require('./images/20779.jpg'),
  '20780': require('./images/20780.jpg'),
  '20781': require('./images/20781.jpg'),
  '20782': require('./images/20782.jpg'),
  '20783': require('./images/20783.jpg'),
  '20784': require('./images/20784.jpg'),
  '20785': require('./images/20785.jpg'),
  '20786': require('./images/20786.jpg'),
  '20787': require('./images/20787.jpg'),
  '20788': require('./images/20788.jpg'),
  '20789': require('./images/20789.jpg'),
  '20790': require('./images/20790.jpg'),
  '20791': require('./images/20791.jpg'),
  '20792': require('./images/20792.jpg'),
  '20793': require('./images/20793.jpg'),
  '20910': require('./images/20910.jpg'),
  '20911': require('./images/20911.jpg'),
  '20925': require('./images/20925.jpg'),
  en_m24_s144_1: require('./images/en_m24_s144_1.jpg'),
  en_m60_s221_140: require('./images/en_m60_s221_140.jpg'),
} as {[key: string]: any};

export const pathToDB = (path?: string) => {
  return path
    ? Platform.select({
        ios: path?.replace(FileSystem.documentDirectory || '', ''),
        default: path,
      })
    : path;
};
export const pathFromDB = (path?: string) => {
  return path
    ? Platform.select({
        ios: `${FileSystem.documentDirectory || ''}${path}`,
        default: path,
      })
    : path;
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
