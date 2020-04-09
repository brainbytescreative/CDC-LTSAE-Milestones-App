import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {StackNavigationProp} from '@react-navigation/stack';

export type AddChildScreenParams =
  | {childId?: string | number; anotherChild?: boolean; onboarding?: boolean}
  | undefined;

export type DashboardStackParamList = {
  AddChild: AddChildScreenParams;
  Dashboard: undefined;
  AddAppointment: {appointmentId: number | string | undefined} | undefined;
};

export type SettingsStackParamList = {
  NotificationSettings: undefined;
};
export type TipsAndActivitiesParamList = {
  TipsAndActivities: undefined;
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
};

export type DashboardDrawerNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;
