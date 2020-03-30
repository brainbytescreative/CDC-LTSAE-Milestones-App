import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import {routeKeys} from '../../resources/constants';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {useTranslation} from 'react-i18next';
import AddChildScreen from '../../screens/AddChildScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DashboardStack from './DashboardStack';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const RootDrawer: React.FC<{}> = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name={routeKeys.Dashboard} component={DashboardStack} />
    </Drawer.Navigator>
  );
};

const Navigator: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routeKeys.OnboardingInfo}
        component={OnboardingInfoScreen}
        options={{
          title: t('onboardingInfo:title'),
        }}
      />
      <Stack.Screen
        name={routeKeys.OnboardingParentProfile}
        component={OnboardingParentProfileScreen}
        options={{
          title: t('onboardingParentProfile:title'),
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name={routeKeys.OnboardingHowToUse}
        component={OnboardingHowToUseScreen}
        options={{
          title: t('onboardingHowToUse:title'),
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name={routeKeys.AddChild}
        component={AddChildScreen}
        options={{
          title: t('addChild:title'),
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name={routeKeys.Dashboard}
        options={{
          header: () => null,
        }}
        component={RootDrawer}
      />
    </Stack.Navigator>
  );
};

export default Navigator;
