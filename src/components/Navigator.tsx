import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingInfoScreen from '../screens/Onboarding/OnboardingInfoScreen';
import {routeKeys} from '../resources/constants';
import OnboardingParentProfileScreen from '../screens/Onboarding/OnboardingParentProfileScreen';
import OnboardingHowToUseScreen from '../screens/Onboarding/OnboardingHowToUseScreen';
import {useTranslation} from 'react-i18next';
import Dashboard from '../screens/Dashboard';
import AddChildScreen from '../screens/AddChildScreen';

const Stack = createStackNavigator();

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
      /><Stack.Screen
        name={routeKeys.Dashboard}
        component={Dashboard}
        options={{
          title: t('dashboard:title'),
          headerLeft: () => null,
        }}
      />
    </Stack.Navigator>
  );
};

export default Navigator;
