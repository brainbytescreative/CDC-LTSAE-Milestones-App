/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-get-random-values';

import {ACPAnalytics} from '@adobe/react-native-acpanalytics';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import crashlytics from '@react-native-firebase/crashlytics';
import {NavigationContainerRef} from '@react-navigation/core';
import {NavigationContainer} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, {useEffect} from 'react';
import {YellowBox} from 'react-native';
import {DefaultTheme, Provider as PaperProvider, Theme} from 'react-native-paper';
// Before rendering any navigation stack
import {enableScreens} from 'react-native-screens';
import {ReactQueryConfigProvider, ReactQueryProviderConfig} from 'react-query';

import AppStateManager from './src/components/AppStateManager';
import Navigator from './src/components/Navigator';
import {colors} from './src/resources/constants';
import {
  currentScreen,
  trackAction,
  trackInteractionByType,
  trackSelectByType,
  trackStartAddChild,
} from './src/utils/analytics';
import {getActiveRouteName} from './src/utils/helpers';

enableScreens();

// First, set the handler that will cause the notification
// to show the alert

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

ACPAnalytics.registerExtension();

console.disableYellowBox = true;
YellowBox.ignoreWarnings(['Setting a timer']);

const theme: Theme = {
  ...DefaultTheme,
  fonts: {
    regular: {fontFamily: 'Montserrat-Regular'},
    medium: {fontFamily: 'Montserrat-Bold'},
    light: {fontFamily: 'Montserrat-Regular'},
    thin: {fontFamily: 'Montserrat-Regular'},
  },
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
    primary: 'black',
    backdrop: colors.whiteTransparent,
    // accent: 'yellow',
  },
};

const queryConfig: ReactQueryProviderConfig = {
  shared: {
    suspense: false,
  },
  queries: {
    staleTime: Infinity,
    retry: false,
  },
};

const App = () => {
  const routeNameRef = React.useRef<string | undefined>(undefined);
  const navigationRef = React.useRef<NavigationContainerRef>(null);

  useEffect(() => {
    ACPAnalytics.extensionVersion().then((version) =>
      console.log('AdobeExperienceSDK: ACPAnalytics version: ' + version),
    );
  }, []);

  React.useEffect(() => {
    crashlytics().log('App mounted.');
    // crashlytics().crash();
    Notifications.requestPermissionsAsync();
    Notifications.getPermissionsAsync();
  }, []);

  return (
    <>
      <AppStateManager />
      <ActionSheetProvider>
        <ReactQueryConfigProvider config={queryConfig}>
          <PaperProvider theme={theme}>
            <NavigationContainer
              ref={(instance) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                navigationRef.current = instance;
                currentScreen.navigation = navigationRef;
              }}
              onStateChange={(state) => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = getActiveRouteName(state);

                // console.log('previousRouteName', previousRouteName);
                // console.log('currentRouteName', currentRouteName);
                currentScreen.currentRouteName = currentRouteName;

                if (previousRouteName !== currentRouteName && currentRouteName) {
                  // trackCurrentScreen(currentRouteName);
                  switch (currentRouteName) {
                    case 'OnboardingHowToUse':
                      trackSelectByType('How to Use App');
                      break;
                    case 'OnboardingParentProfile':
                      trackAction('Interaction: Parent/Caregiver Profile: Started');
                      break;
                    case 'AddChild': {
                      trackStartAddChild();
                      break;
                    }
                    case 'AddAppointment': {
                      trackInteractionByType('Start Add Appointment');
                      break;
                    }
                  }
                  crashlytics().log(currentRouteName);
                }

                if (previousRouteName === 'OnboardingParentProfile') {
                  trackAction('Interaction: Parent/Caregiver Profile: Complete');
                }

                // Save the current route name for later comparision
                routeNameRef.current = currentRouteName;
              }}>
              <Navigator navigation={navigationRef.current} />
            </NavigationContainer>
          </PaperProvider>
        </ReactQueryConfigProvider>
      </ActionSheetProvider>
    </>
  );
};

export default App;
