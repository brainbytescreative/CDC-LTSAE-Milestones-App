import {ACPCore} from '@adobe/react-native-acpcore';
import {NavigationContainerRef} from '@react-navigation/core';
import i18next from 'i18next';
import {RefObject} from 'react';
import {Platform} from 'react-native';
import {getModel, getReadableVersion} from 'react-native-device-info';

import {DashboardDrawerParamsList} from '../components/Navigator/types';
import {Answer, ChildResult} from '../hooks/types';
import {Section, SelectEventType, drawerMenuToEvent, sectionToEvent} from '../resources/constants';
import {LangCode} from '../resources/l18n';
import {formatAge, getActiveRouteName} from './helpers';

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

type OptionsType = Parameters<typeof trackAction>[1];

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
    case 'MilestoneChecklistWhenToActEarly':
      return 'When to Act Early';
    default:
      return name;
  }
};

export function trackAction(key: string, options?: {page?: PageType; eventname?: string; sectionname?: string}) {
  const screenName =
    currentScreen.currentRouteName ?? getActiveRouteName(currentScreen.navigation?.current?.getRootState());
  const pageName = options?.page ?? (screenName && screeNameToPageName(screenName));
  // console.log('<<<', pageName, `,key: ${key}`);

  console.log(pageName, options?.sectionname, key);

  pageName &&
    ACPCore.trackState(pageName, {
      'gov.cdc.appname': 'Mobile App Dev',
      'gov.cdc.language': i18next.language, // t5 (Language)
      'gov.cdc.appversion': getReadableVersion(), //t51 (Mobile Framework)
      'gov.cdc.osname': Platform.OS, //t54 (OS Name)
      'gov.cdc.osversion': `${Platform.Version}`, // t55 (OS Version)
      'gov.cdc.devicetype': getModel(), // t56 (Device Type)
      'gov.cdc.status': '1', // t57 (Status)
      'gov.cdc.eventname': key,
      // ...(options?.eventname && {'gov.cdc.eventname': options.eventname}),
      ...(options?.sectionname && {'gov.cdc.sectionname': options.sectionname}),
      ...(pageName && {'gov.cdc.page': pageName}),
    });
}

export function trackAppLaunch(options?: OptionsType) {
  trackAction('Application: Launch', options);
}

export function trackStartTracking(options?: OptionsType) {
  trackAction('Interaction: Start Tracking ', {page: 'Welcome Screen', ...options});
}
const lngDescr = {en: 'English', es: 'Spanish'};

export function trackSelectLanguage(lng: LangCode) {
  const language = (lng ?? i18next.language) as keyof typeof lng;
  trackAction(`Select: Language: ${lngDescr[language]}`);
}

export function trackTopCancel(options?: OptionsType) {
  trackAction('Select: Cancel', options);
}
export function trackTopDone(options?: OptionsType) {
  trackAction('Select: Done', options);
}

export function trackSelectProfile(value: string) {
  trackAction(`Select: Profile: ${value}`);
}

export function trackSelectTerritory(trerritory: string) {
  trackAction(`Select: ${trerritory}`);
}
export function trackNext(options?: OptionsType) {
  trackAction('Interaction: Next', options);
}
export function trackStartAddChild(options?: OptionsType) {
  trackAction('Interaction: Start Add Child', options);
}

export function trackCompleteAddChild(options?: OptionsType) {
  trackAction('Interaction: Completed Add Child', options);
}
export function trackAddAnotherChild(options?: OptionsType) {
  trackAction('Interaction: Add Another Child', options);
}

export function trackChildAddAPhoto(options?: OptionsType) {
  trackAction('Interaction: Add a Photo', options);
}
// fixme
export function trackChildAddPhotoFromLibrary() {
  trackAction('Interaction: Add Photo from Library');
}
// fixme
export function trackChildAddPhotoTakePhoto() {
  trackAction('Interaction: Take Photo');
}
export function trackChildCompletedAddPhoto(options?: OptionsType) {
  trackAction('Interaction: Completed Add Photo', options);
}
// fixme
export function trackChildCompletedAddPhotoLibrary() {
  trackAction('Interaction: Completed Add Photo: Library');
}
// fixme
export function trackChildCompletedAddPhotoTake() {
  trackAction('Interaction: Completed Add Photo: Take');
}

export function trackChildCompletedAddChildName(options?: OptionsType) {
  trackAction('Interaction: Completed Add Child Name', options);
}
export function trackChildAddChildName(options?: OptionsType) {
  trackAction('Interaction: Add Child Name', options);
}
export function trackChildStartedChildDateOfBirth(options?: OptionsType) {
  trackAction('Interaction: Started Child Date of Birth', options);
}
export function trackChildCompletedChildDateOfBirth(options?: OptionsType) {
  trackAction('Interaction: Completed Child Date of Birth', options);
}
export function trackChildAge(birthDay: Parameters<typeof formatAge>[0]) {
  const age = formatAge(birthDay);
  trackAction(`Child: Age ${age}`);
}

export function trackChildGender(gender: ChildResult['gender']) {
  const genders = ['Boy', 'Girl'];
  trackAction(`Child: ${genders[gender]}`);
}

export function trackChildDone(options?: OptionsType) {
  trackAction('Interaction: Done', options);
}

export function trackSelectByType(type: SelectEventType, options?: Parameters<typeof trackAction>[1]) {
  trackAction(`Select: ${type}`, options);
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
  | 'Email Summary'
  | 'Show Doctor'
  | 'Completed When to Act Early';

export function trackInteractionByType(type: InteractionType, options?: OptionsType) {
  trackAction(`Interaction: ${type}`, options);
}

export function trackChecklistSectionSelect(section: Section) {
  trackSelectByType(sectionToEvent[section]);
}

export function trackDrawerSelect(name: keyof DashboardDrawerParamsList) {
  const selectName = drawerMenuToEvent[name];
  selectName && trackSelectByType(selectName, {page: 'Menu Page'});
}

export function trackSelectChild(childId: ChildResult['id'], options?: Parameters<typeof trackAction>[1]) {
  trackAction(`Select: Child #${childId}`, options);
}

const AnswerToText = ['Yes', 'Not Sure', 'Not Yet'];

export function trackChecklistAnswer(answer: Answer) {
  trackAction(`Answer: ${AnswerToText[answer]}`);
}

export function trackChecklistUnanswered(options?: OptionsType) {
  trackAction('Answer: Unanswered', options);
}

export function trackSelectSummary(answer: Answer) {
  trackAction(`Select: Summary: ${AnswerToText[answer]}`);
}

export const currentScreen: {navigation?: RefObject<NavigationContainerRef>; currentRouteName?: string} = {};
