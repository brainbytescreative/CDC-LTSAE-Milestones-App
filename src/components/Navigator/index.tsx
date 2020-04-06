import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {useTranslation} from 'react-i18next';
import AddChildScreen from '../../screens/AddChildScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DashboardStack from './DashboardStack';
import {DashboardDrawerParamsList, RootStackParamList} from './types';
import SettingsStack from './SettingsStack';
import {useGetOnboarding} from '../../hooks/onboardingHooks';

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DashboardDrawerParamsList>();

const RootDrawer: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Drawer.Navigator initialRouteName={'SettingsStack'}>
      <Drawer.Screen
        name={'DashboardStack'}
        options={{
          drawerLabel: t('dashboard:drawerLabel'),
        }}
        component={DashboardStack}
      />
      <Drawer.Screen
        name={'SettingsStack'}
        options={{
          drawerLabel: t('settings:drawerLabel'),
        }}
        component={SettingsStack}
      />
    </Drawer.Navigator>
  );
};

const Navigator: React.FC<{}> = () => {
  const {t} = useTranslation();
  const {data, isFetching} = useGetOnboarding();

  const isOnboarded = false;

  return (
    <>
      {!isFetching && (
        <Stack.Navigator>
          {!isOnboarded && (
            <>
              {/*<Stack.Screen*/}
              {/*  name={'OnboardingInfo'}*/}
              {/*  component={OnboardingInfoScreen}*/}
              {/*  options={{*/}
              {/*    title: t('onboardingInfo:title'),*/}
              {/*  }}*/}
              {/*/>*/}
              <Stack.Screen
                name={'OnboardingParentProfile'}
                component={OnboardingParentProfileScreen}
                options={{
                  title: t('onboardingParentProfile:title'),
                  headerLeft: () => null,
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
