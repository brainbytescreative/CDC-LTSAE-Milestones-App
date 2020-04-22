import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {useTranslation} from 'react-i18next';
import AddChildScreen from '../../screens/AddChildScreen';
import {RootStackParamList} from './types';
import RootDrawer from './RootDrawer';
import {useGetOnboarding} from '../../hooks/onboardingHooks';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC<{}> = () => {
  const {t} = useTranslation();
  const {data, isFetching} = useGetOnboarding();
  // const {data: children, isFetching} = useGetChildren();

  const isOnboarded = false;

  return (
    <>
      {!isFetching && (
        <Stack.Navigator>
          {!isOnboarded && (
            <>
              <Stack.Screen
                name={'OnboardingInfo'}
                component={OnboardingInfoScreen}
                options={{
                  header: () => null,
                }}
              />
              <Stack.Screen
                name={'OnboardingParentProfile'}
                component={OnboardingParentProfileScreen}
                options={{
                  header: () => null,
                }}
              />
              <Stack.Screen
                name={'OnboardingHowToUse'}
                component={OnboardingHowToUseScreen}
                options={{
                  title: t('onboardingHowToUse:title'),
                  headerLeft: () => null,
                }}
              />
              <Stack.Screen
                name={'AddChild'}
                component={AddChildScreen}
                options={{
                  title: t('addChild:title'),
                  headerLeft: () => null,
                }}
              />
            </>
          )}
          <Stack.Screen
            name={'Dashboard'}
            options={{
              header: () => null,
            }}
            component={RootDrawer}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

export default Navigator;
