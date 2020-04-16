import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {ChildResult} from '../../hooks/childrenHooks';

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
  Dashboard: undefined;
  AddAppointment: {appointmentId: number | string | undefined} | undefined;
  Appointment: {appointmentId: number | string};
  MilestoneChecklist: undefined;
};

export type SettingsStackParamList = {
  NotificationSettings: undefined;
};
export type TipsAndActivitiesParamList = {
  TipsAndActivities: undefined;
};
export type InfoParamList = {
  Info: undefined;
};

export type RootStackParamList = {
  AddChild: AddChildScreenParams;
  OnboardingInfo: undefined;
  OnboardingParentProfile: undefined;
  OnboardingHowToUse: undefined;
  Dashboard: undefined;
};

export type DashboardDrawerParamsList = {
  DashboardStack: undefined;
  SettingsStack: undefined;
  TipsAndActivitiesStack: undefined;
  InfoStack: undefined;
};

export type DashboardDrawerNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;
