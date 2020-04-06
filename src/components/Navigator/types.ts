export type AddChildScreenParams =
  | {childId?: string | number; anotherChild?: boolean; onboarding?: boolean}
  | undefined;

export type DashboardStackParamList = {
  AddChild: AddChildScreenParams;
  Dashboard: undefined;
};

export type SettingsStackParamList = {
  NotificationSettings: undefined;
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
};
