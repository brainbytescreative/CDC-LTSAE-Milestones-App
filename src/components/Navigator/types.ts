import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {ChildResult} from '../../hooks/types';

export type AddChildScreenParams =
  | {
      childId?: number;
      anotherChild?: boolean;
      onboarding?: boolean;
      child?: Pick<ChildResult, 'photo' | 'gender' | 'name' | 'birthday'> | undefined;
    }
  | undefined;

export type DashboardStackParamList = {
  AddChild: AddChildScreenParams;
  Dashboard: {addChild?: boolean} | undefined;
  AddAppointment: {appointmentId: number | undefined} | undefined;
  Appointment: {appointmentId: number; toDashboard?: boolean};
  MilestoneChecklist: undefined;
  ChildSummary: undefined;
  TipsAndActivities: undefined;
  Revisit: undefined;
  WhenActEarly: undefined;
};

export type OnboardingNavigationProp = StackNavigationProp<RootStackParamList>;

export type SettingsStackParamList = {
  NotificationSettings: undefined;
};
export type ChildSummaryParamList = {
  ChildSummary: undefined;
  Revisit: undefined;
};
export type TipsAndActivitiesParamList = {
  TipsAndActivities: undefined;
};
export type InfoStackParamList = {
  Info: undefined;
  PrivacyPolicy: undefined;
};
export type MilestoneCheckListParamList = {
  MilestoneChecklist: {actEarly: boolean} | undefined;
  MilestoneChecklistGetStarted: undefined;
  MilestoneChecklistQuickView: {quickView?: boolean} | undefined;
  MilestoneChecklistWhenToActEarly: undefined;
  ChildSummary: undefined;
  Revisit: undefined;
};

export type RootStackParamList = {
  AddChild: AddChildScreenParams;
  OnboardingInfo: undefined;
  OnboardingParentProfile: undefined;
  OnboardingHowToUse: undefined;
  Dashboard: undefined;
};

export type DashboardDrawerParamsList = {
  DashboardStack:
    | {addChild?: boolean; screen?: keyof DashboardStackParamList; params?: AddChildScreenParams}
    | undefined;
  AddChildStub: {redirect: [string, any]} | undefined;
  WhenToActEarly: {redirect: [string, any]} | undefined;
  SettingsStack: undefined;
  MilestoneChecklistStack: undefined;
  MilestoneQuickViewStack: {initialRouteName?: keyof MilestoneCheckListParamList; quickView?: boolean} | undefined;
  TipsAndActivitiesStack: undefined;
  InfoStack: undefined;
  ChildSummaryStack: undefined;
};

export type DashboardDrawerNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;
