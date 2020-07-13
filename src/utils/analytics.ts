import {ACPCore} from '@adobe/react-native-acpcore';
import i18next from 'i18next';
import {Platform} from 'react-native';
import {getModel, getReadableVersion} from 'react-native-device-info';
import {LangCode} from '../resources/l18n';
import {formatAge, getActiveRouteName} from './helpers';
import {ChildResult} from '../hooks/childrenHooks';
import {drawerMenuToEvent, Section, sectionToEvent, SelectEventType} from '../resources/constants';
import {DashboardDrawerParamsList} from '../components/Navigator/types';
import {Answer} from '../hooks/types';
import {RefObject} from 'react';
import {NavigationContainerRef} from '@react-navigation/core';

type PageType =
  | 'Child Dropdown Page'
  | 'Menu Page'
  | 'Welcome Screen'
  | 'Parent/Caregiver Profile'
  | 'How to Use App'
  | 'Dashboard'
  | 'Milestone Checklist Intro Page'
  | 'Main Milestone Home'
  | 'Milestone Checklist'
  | 'When to Act Early'
  | 'Milestone Quick View'
  | "My Child's Summary"
  | 'Tips'
  | 'Add Appointment'
  | 'Appointment'
  | 'Info/Privacy Policy'
  | 'Notifications'
  | 'Notification and Account Settings'
  | 'Add a Child (Child Profile)';

type OptionsType = Parameters<typeof trackState>[1];

const screeNameToPageName = (name: string): PageType | string => {
  switch (name) {
    case 'OnboardingParentProfile':
      return 'Parent/Caregiver Profile';
    case 'OnboardingInfo':
      return 'Welcome Screen';
    case 'OnboardingHowToUse':
      return 'How to Use App';
    case 'AddChild':
      return 'Add a Child (Child Profile)';
    case 'Dashboard':
      return 'Dashboard';
    case 'MilestoneChecklistGetStarted':
      return 'Milestone Checklist Intro Page';
    case 'NotificationSettings':
      return 'Notification and Account Settings';
    case 'MilestoneChecklist':
      return 'Milestone Checklist';
    case 'ChildSummary':
      return "My Child's Summary";
    case 'MilestoneChecklistQuickView':
      return 'Milestone Quick View';
    case 'TipsAndActivities':
      return 'Tips';
    case 'Info':
      return 'Info/Privacy Policy';
    case 'AddAppointment':
      return 'Add Appointment';
    case 'Appointment':
      return 'Appointment';
    default:
      return name;
  }
};

export function trackState(key: string, options?: {page?: PageType; eventname?: string; sectionname?: string}) {
  const screenName =
    currentScreen.currentRouteName ?? getActiveRouteName(currentScreen.navigation?.current?.getRootState());
  const pageName = options?.page ?? (screenName && screeNameToPageName(screenName));
  console.log('<<<', pageName, `,key: ${key}`);

  ACPCore.trackState(key, {
    'gov.cdc.appname': 'CDC Health IQ',
    'gov.cdc.language': i18next.language, // t5 (Language)
    'gov.cdc.appversion': getReadableVersion(), //t51 (Mobile Framework)
    'gov.cdc.osname': Platform.OS, //t54 (OS Name)
    'gov.cdc.osversion': `${Platform.Version}`, // t55 (OS Version)
    'gov.cdc.devicetype': getModel(), // t56 (Device Type)
    'gov.cdc.status': '1', // t57 (Status)
    ...(options?.eventname && {'gov.cdc.eventname': options.eventname}),
    ...(options?.sectionname && {'gov.cdc.sectionname': options.sectionname}),
    ...(pageName && {'gov.cdc.page': pageName}),
  });
}

export function trackAppLaunch(options?: OptionsType) {
  trackState('Application: Launch', options);
}

export function trackStartTracking(options?: OptionsType) {
  trackState('Interaction: Start Tracking ', {page: 'Welcome Screen', ...options});
}
const lngDescr = {en: 'English', es: 'Spanish'};

export function trackSelectLanguage(lng: LangCode) {
  const language = (lng ?? i18next.language) as keyof typeof lng;
  trackState(`Select: Language: ${lngDescr[language]}`);
}

export function trackHowToUseApp() {
  trackState('Select: How to Use App');
}

export function trackTopCancel(options?: OptionsType) {
  trackState('Select: Cancel', options);
}
export function trackTopDone(options?: OptionsType) {
  trackState('Select: Done', options);
}

export function trackSelectProfile(value: string) {
  trackState(`Select: Profile: ${value}`);
}

export function trackSelectTerritory(trerritory: string) {
  trackState(`Select: ${trerritory}`);
}
export function trackNext(options?: OptionsType) {
  trackState('Interaction: Next', options);
}
export function trackStartAddChild(options?: OptionsType) {
  trackState('Interaction: Start Add Child', options);
}

export function trackCompleteAddChild(options?: OptionsType) {
  trackState('Interaction: Completed Add Child', options);
}
export function trackAddAnotherChild(options?: OptionsType) {
  trackState('Interaction: Add Another Child', options);
}

export function trackChildAddAPhoto(options?: OptionsType) {
  trackState('Interaction: Add a Photo', options);
}
// fixme
export function trackChildAddPhotoFromLibrary() {
  trackState('Interaction: Add Photo from Library');
}
// fixme
export function trackChildAddPhotoTakePhoto() {
  trackState('Interaction: Take Photo');
}
export function trackChildCompletedAddPhoto(options?: OptionsType) {
  trackState('Interaction: Completed Add Photo', options);
}
// fixme
export function trackChildCompletedAddPhotoLibrary() {
  trackState('Interaction: Completed Add Photo: Library');
}
// fixme
export function trackChildCompletedAddPhotoTake() {
  trackState('Interaction: Completed Add Photo: Take');
}

export function trackChildCompletedAddChildName(options?: OptionsType) {
  trackState('Interaction: Completed Add Child Name', options);
}
export function trackChildAddChildName(options?: OptionsType) {
  trackState('Interaction: Add Child Name', options);
}
export function trackChildStartedChildDateOfBirth(options?: OptionsType) {
  trackState('Interaction: Started Child Date of Birth', options);
}
export function trackChildCompletedChildDateOfBirth(options?: OptionsType) {
  trackState('Interaction: Completed Child Date of Birth', options);
}
export function trackChildAge(birthDay: Parameters<typeof formatAge>[0]) {
  const age = formatAge(birthDay);
  trackState(`Child: Age ${age}`);
}

export function trackChildGender(gender: ChildResult['gender']) {
  const genders = ['Boy', 'Girl'];
  trackState(`Child: ${genders[gender]}`);
}

export function trackChildDone(options?: OptionsType) {
  trackState('Interaction: Done', options);
}

export function trackSelectByType(type: SelectEventType, options?: Parameters<typeof trackState>[1]) {
  trackState(`Select: ${type}`, options);
}

type InteractionType =
  | 'Get Started'
  | 'Scroll Photo'
  | 'Add Milestone Note'
  | 'Add Act Early Note'
  | 'Next Section'
  | 'Next'
  | 'Play Video'
  | 'Back'
  | 'Cancel'
  | 'Like'
  | 'Edit Appointment'
  | 'Delete Notification'
  | 'Delete Appointment'
  | 'Remind Me'
  | 'My Child Summary'
  | 'Start Add Appointment'
  | 'Completed Add Appointment'
  | 'Checked Act Early Item'
  | 'Started Social Milestones'
  | 'Completed Social Milestones'
  | 'Started Language Milestones'
  | 'Completed Language Milestones'
  | 'Started Cognitive Milestones'
  | 'Completed Cognitive Milestones'
  | 'Started Movement Milestones'
  | 'Completed Movement Milestones'
  | 'Started When to Act Early'
  | 'Completed When to Act Early';

export function trackInteractionByType(type: InteractionType, options?: OptionsType) {
  trackState(`Interaction: ${type}`, options);
}

export function trackChecklistSectionSelect(section: Section) {
  trackSelectByType(sectionToEvent[section]);
}

export function trackDrawerSelect(name: keyof DashboardDrawerParamsList) {
  const selectName = drawerMenuToEvent[name];
  selectName && trackSelectByType(selectName, {page: 'Menu Page'});
}

export function trackSelectChild(childId: ChildResult['id'], options?: Parameters<typeof trackState>[1]) {
  trackState(`Select: Child #${childId}`, options);
}

const AnswerToText = ['Yes', 'Not Sure', 'Not Yet'];

export function trackChecklistAnswer(answer: Answer) {
  trackState(`Answer: ${AnswerToText[answer]}`);
}

export function trackChecklistUnanswered(options?: OptionsType) {
  trackState('Answer: Unanswered', options);
}

export function trackSelectSummary(answer: Answer) {
  trackState(`Select: Summary: ${AnswerToText[answer]}`);
}

export const currentScreen: {navigation?: RefObject<NavigationContainerRef>; currentRouteName?: string} = {};
