import {ACPCore} from '@adobe/react-native-acpcore';
import i18next from 'i18next';
import {Platform} from 'react-native';
import {getModel, getReadableVersion} from 'react-native-device-info';
import {LangCode} from '../resources/l18n';
import {formatAge} from './helpers';
import {ChildResult} from '../hooks/childrenHooks';
import {drawerMenuToEvent, Section, sectionToEvent, SelectEventType} from '../resources/constants';
import {DashboardDrawerParamsList} from '../components/Navigator/types';
import {Answer} from '../hooks/types';

type PageType = 'Child Dropdown Page' | 'Menu Page';

export function trackState(key: string, options?: {page?: PageType; eventname?: string; sectionname?: string}) {
  ACPCore.trackState(key, {
    'gov.cdc.appname': 'CDC Health IQ',
    'gov.cdc.language': i18next.language, // t5 (Language)
    'gov.cdc.appversion': getReadableVersion(), //t51 (Mobile Framework)
    'gov.cdc.osname': Platform.OS, //t54 (OS Name)
    'gov.cdc.osversion': `${Platform.Version}`, // t55 (OS Version)
    'gov.cdc.devicetype': getModel(), // t56 (Device Type)
    'gov.cdc.status': '1', // t57 (Status)
    'gov.cdc.eventname': options?.eventname ?? '', // t58 (Event Name)
    'gov.cdc.sectionname': options?.sectionname ?? '', // t59 (Section Name)
  });
}

export function trackCurrentScreen(routeName: string) {
  trackState(routeName);
}

export function trackAppLaunch() {
  trackState('Application: Launch');
}

export function trackStartTracking() {
  trackState('Interaction: Start Tracking ');
}
const lngDescr = {en: 'English', es: 'Spanish'};

export function trackSelectLanguage(lng: LangCode) {
  const language = (lng ?? i18next.language) as keyof typeof lng;
  trackState(`Select: Language: ${lngDescr[language]}`);
}

export function trackHowToUseApp() {
  trackState('Select: How to Use App');
}

export function trackTopCancel() {
  trackState('Select: Cancel');
}
export function trackTopDone() {
  trackState('Select: Done');
}

export function trackSelectProfile(value: string) {
  trackState(`Select: Profile: ${value}`);
}

export function trackSelectTerritory(trerritory: string) {
  trackState(`Select: ${trerritory}`);
}
export function trackNext() {
  trackState('Interaction: Next');
}
export function trackStartAddChild() {
  trackState('Interaction: Start Add Child');
}

export function trackCompleteAddChild() {
  trackState('Interaction: Completed Add Child');
}
export function trackAddAnotherChild() {
  trackState('Interaction: Add Another Child');
}

export function trackChildAddAPhoto() {
  trackState('Interaction: Add a Photo');
}
// fixme
export function trackChildAddPhotoFromLibrary() {
  trackState('Interaction: Add Photo from Library');
}
// fixme
export function trackChildAddPhotoTakePhoto() {
  trackState('Interaction: Take Photo');
}
export function trackChildCompletedAddPhoto() {
  trackState('Interaction: Completed Add Photo');
}
// fixme
export function trackChildCompletedAddPhotoLibrary() {
  trackState('Interaction: Completed Add Photo: Library');
}
// fixme
export function trackChildCompletedAddPhotoTake() {
  trackState('Interaction: Completed Add Photo: Take');
}

export function trackChildCompletedAddChildName() {
  trackState('Interaction: Completed Add Child Name');
}
export function trackChildAddChildName() {
  trackState('Interaction: Add Child Name');
}
export function trackChildStartedChildDateOfBirth() {
  trackState('Interaction: Started Child Date of Birth');
}
export function trackChildCompletedChildDateOfBirth() {
  trackState('Interaction: Completed Child Date of Birth');
}
export function trackChildAge(birthDay: Parameters<typeof formatAge>[0]) {
  const age = formatAge(birthDay);
  trackState(`Child: Age ${age}`);
}

export function trackChildGender(gender: ChildResult['gender']) {
  const genders = ['Boy', 'Girl'];
  trackState(`Child: ${genders[gender]}`);
}

export function trackChildDone() {
  trackState('Interaction: Done');
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

export function trackInteractionByType(type: InteractionType) {
  trackState(`Interaction: ${type}`);
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

export function trackChecklistUnanswered() {
  trackState('Answer: Unanswered');
}

export function trackSelectSummary(answer: Answer) {
  trackState(`Select: Summary: ${AnswerToText[answer]}`);
}
