import {ACPCore} from '@adobe/react-native-acpcore';
import {NavigationContainerRef} from '@react-navigation/core';
import i18next from 'i18next';
import _ from 'lodash';
import {RefObject} from 'react';
import {Platform} from 'react-native';
import {getModel, getReadableVersion} from 'react-native-device-info';
import {queryCache} from 'react-query';

import {DashboardDrawerParamsList} from '../components/Navigator/types';
import {Answer, ChildResult, MilestoneQueryResult} from '../hooks/types';
import {Section, SelectEventType, drawerMenuToEvent, sectionToEvent} from '../resources/constants';
import {LangCode} from '../resources/l18n';
import {Quetion, checklistMap} from '../resources/milestoneChecklist';
import {formatAge, getActiveRouteName} from './helpers';

export type PageType =
  | 'Child Drop-Down'
  | 'Menu'
  | 'Welcome Screen'
  | 'Parent/Caregiver Profile'
  | 'How to Use App'
  | 'Dashboard'
  | 'Milestone Checklist Intro'
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
  | 'Language Pop-Up'
  | 'Notification and Settings'
  | 'Add a Child (Child Profile)';

type OptionsType = Parameters<typeof trackAction>[1];

const screeNameToPageName = (name: string): PageType | string => {
  let pageName: PageType | undefined;

  switch (name) {
    case 'OnboardingParentProfile':
      pageName = 'Parent/Caregiver Profile';
      break;
    case 'OnboardingInfo':
      pageName = 'Welcome Screen';
      break;
    case 'OnboardingHowToUse':
      pageName = 'How to Use App';
      break;
    case 'AddChild':
      pageName = 'Add a Child (Child Profile)';
      break;
    case 'Dashboard':
      pageName = 'Main Milestone Home';
      break;
    case 'MilestoneChecklistGetStarted':
      pageName = 'Milestone Checklist Intro';
      break;
    case 'NotificationSettings':
      pageName = 'Notification and Settings';
      break;
    case 'MilestoneChecklist':
      pageName = 'Milestone Checklist';
      break;
    case 'ChildSummary':
      pageName = "My Child's Summary";
      break;
    case 'MilestoneChecklistQuickView':
      pageName = 'Milestone Quick View';
      break;
    case 'TipsAndActivities':
      pageName = 'Tips';
      break;
    case 'Info':
      pageName = 'Info/Privacy Policy';
      break;
    case 'AddAppointment':
      pageName = 'Add Appointment';
      break;
    case 'Appointment':
      pageName = 'Appointment';
      break;
    case 'MilestoneChecklistWhenToActEarly':
      pageName = 'When to Act Early';
      break;
  }

  return pageName ?? name;
};

function trackActionInternal(pageName: undefined | string, key: string, options?: {sectionName?: string}) {
  pageName &&
    ACPCore.trackState(pageName, {
      'gov.cdc.appname': 'Milestone Tracker',
      'gov.cdc.language': i18next.language, // t5 (Language)
      'gov.cdc.appversion': getReadableVersion(), //t51 (Mobile Framework)
      'gov.cdc.osname': Platform.OS, //t54 (OS Name)
      'gov.cdc.osversion': `${Platform.Version}`, // t55 (OS Version)
      'gov.cdc.devicetype': getModel(), // t56 (Device Type)
      'gov.cdc.status': '1', // t57 (Status)
      'gov.cdc.eventname': key,
      ...(options?.sectionName && {'gov.cdc.sectionname': options.sectionName}),
      ...(pageName && {'gov.cdc.page': pageName}),
    });
}

type BaseAnalyticsData = {
  milestoneId: number;
};

type QuestionAnalyticsData = {
  questionId: number;
} & BaseAnalyticsData;

type TipAnalyticsData = {
  hintId: number;
} & BaseAnalyticsData;

type ConcernAnalyticsData = {
  concernId: number;
} & BaseAnalyticsData;

export function trackAction(
  key: string,
  options?: {
    page?: PageType;
    eventname?: string;
    sectionName?: string;
    questionData?: QuestionAnalyticsData;
    tipData?: TipAnalyticsData;
    concernData?: ConcernAnalyticsData;
  },
) {
  const screenName =
    currentScreen.currentRouteName ?? getActiveRouteName(currentScreen.navigation?.current?.getRootState());
  const pageName = options?.page ?? (screenName && screeNameToPageName(screenName));
  // console.log('<<<', pageName, `,key: ${key}`);
  // console.log(pageName, options?.sectionName, key);
  // console.log(pageName, key);
  trackChecklistPage(key, {...options, pageName});
  trackActionInternal(pageName, key, {sectionName: options?.sectionName});
}

function getMilestoneData() {
  const selectedChildId = queryCache.getQueryData('selectedChildId');
  const child: ChildResult | undefined = queryCache.getQueryData(['selectedChild', {id: selectedChildId}]);
  const childBirthday = child?.birthday;
  const milestoneId = Number(
    queryCache.getQueryData<MilestoneQueryResult>(['milestone', {childBirthday}])?.milestoneAge,
  );
  return {milestoneId, selectedChildId};
}

type AdditionalChecklistParams = Omit<NonNullable<OptionsType>, 'page' | 'eventname' | 'sectionName'> | undefined;

function trackChecklistPage(key: string, data: {pageName?: PageType | string} & AdditionalChecklistParams) {
  let suffix = '';
  switch (data.pageName) {
    case 'When to Act Early': {
      if (data.concernData) {
        const [concern] =
          checklistMap
            .get(data.concernData.milestoneId)
            ?.concerns.filter((value) => value.id === data.concernData?.concernId) ?? [];
        const concernText = i18next.t(`milestones:${concern.value}`, {lng: 'en'});
        suffix = `: ${_.trim(concernText, '.')}`;
      } else {
        suffix = ': Act Early';
      }
      break;
    }
    case 'Milestone Checklist Intro': {
      suffix = ': Milestones';
      break;
    }
    case 'Milestone Checklist': {
      const section: string | undefined = queryCache.getQueryData('section');
      if (data.questionData && section) {
        const [question] =
          checklistMap
            .get(data.questionData.milestoneId)
            ?.milestones.filter((value) => value.id === data.questionData?.questionId) ?? [];
        const questionText = i18next.t(`milestones:${question.value}`, {lng: 'en'});

        suffix = `: ${section}: ${_.trim(questionText, '.')}`;
      } else if (section) {
        suffix = `: ${_.startCase(section)}`;
      }
      break;
    }
    case 'Milestone Quick View': {
      suffix = ': Quickview';
      break;
    }
    case 'Tips': {
      if (data.tipData) {
        const [tip] =
          checklistMap
            .get(data.tipData.milestoneId)
            ?.helpful_hints.filter((value) => value.id === data.tipData?.hintId) ?? [];
        suffix = `: Tip: ${i18next.t(`milestones:${tip.value}`)}`;
      } else {
        suffix = ': Tips';
      }

      break;
    }
    default: {
      return;
    }
  }

  // 'selectedChildId'
  // ['selectedChild', {id: selectedChildId}]
  //   ['milestone', {childBirthday}]
  const milestoneId = getMilestoneData().milestoneId;
  const milestoneAgeFormatted =
    milestoneId % 12 === 0
      ? i18next.t('common:yearSingular', {count: milestoneId / 12, lng: 'en'})
      : i18next.t('common:monthSingular', {count: milestoneId, lng: 'en'});
  const pageName = `${_.startCase(milestoneAgeFormatted)}${suffix}`;
  // console.log(pageName, key);
  trackActionInternal(pageName, key);
}

// type EventType =
//   | 'Answer: Yes'
//   | 'Answer: Not Sure'
//   | 'Answer: Not Yet'
//   | 'Answer: Unanswered'
//   | 'Interaction: Get Started';
//
// type TabType = 'Milestones' | 'Quickview' | 'Social' | 'Language' | 'Cognitive' | 'Movement' | SkillType;
//
// export function trackByChecklistAge(page: {age: number; tab: TabType; details?: string}, event: EventType) {
//   const tail = page.details ? `: ${page.details}` : '';
//   trackActionInternal(`${page.age}: ${page.tab}${tail}`, event);
//   return;
// }

export function trackAppLaunch(options?: OptionsType) {
  trackAction('Application: Launch', options);
}

export function trackStartTracking(options?: OptionsType) {
  trackAction('Interaction: Start Tracking ', {page: 'Welcome Screen', ...options});
}
const lngDescr = {en: 'English', es: 'Spanish'};

export function trackSelectLanguage(lng: LangCode, options?: OptionsType) {
  const language = (lng ?? i18next.language) as keyof typeof lng;
  trackAction(`Select: Language: ${lngDescr[language]}`, options);
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

const notificationSetting: Record<string, string | undefined> = {
  milestoneNotifications: 'Milestone Notifications',
  appointmentNotifications: 'Appointment Notifications',
  recommendationNotifications: 'Reccomendation Notifications',
  tipsAndActivitiesNotification: 'Tips Notifications',
};

export function trackNotificationSelect(name: string) {
  const selectName = notificationSetting[name];
  selectName && trackAction(`Select: ${selectName}`);
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
  selectName && trackSelectByType(selectName, {page: 'Menu'});
}

export function trackSelectChild(childId: ChildResult['id'], options?: Parameters<typeof trackAction>[1]) {
  trackAction(`Select: Child #${childId}`, options);
}

const AnswerToText = ['Yes', 'Not Sure', 'Not Yet'];

export function trackChecklistAnswer(answer: Answer, options?: OptionsType) {
  trackAction(`Answer: ${AnswerToText[answer]}`, options);
}

export function trackChecklistUnanswered(options?: OptionsType) {
  const {milestoneId, selectedChildId: childId} = getMilestoneData();
  const data: {unansweredData: Quetion[] | undefined} | undefined = queryCache.getQueryData([
    'answers',
    {milestoneId, childId},
  ]);
  if (data?.unansweredData?.length) {
    trackAction('Answer: Unanswered', options);
  }
}

export function trackSelectSummary(answer: Answer) {
  trackAction(`Select: Summary: ${AnswerToText[answer]}`);
}

export const currentScreen: {navigation?: RefObject<NavigationContainerRef>; currentRouteName?: string} = {};
