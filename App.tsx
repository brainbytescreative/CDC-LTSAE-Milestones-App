/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {Ref, useEffect} from 'react';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import {NavigationContainer, NavigationContainerProps} from '@react-navigation/native';
import Navigator from './src/components/Navigator';
import {I18nextProvider} from 'react-i18next';
import i18next from './src/resources/l18n';
import {DefaultTheme, Provider as PaperProvider, Theme} from 'react-native-paper';
import {queryCache, ReactQueryConfigProvider, ReactQueryProviderConfig} from 'react-query';
import {colors, PropType} from './src/resources/constants';
import {ACPAnalytics} from '@adobe/react-native-acpanalytics';
import {ACPCore} from '@adobe/react-native-acpcore';
import {YellowBox} from 'react-native';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import * as Notifications from 'expo-notifications';
import {NavigationContainerRef} from '@react-navigation/core';
import AppStateManager from './src/components/AppStateManager';
import crashlytics from '@react-native-firebase/crashlytics';
// Before rendering any navigation stack
import {enableScreens} from 'react-native-screens';
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

// console.disableYellowBox = true;
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
  suspense: false,
  staleTime: Infinity,
  retry: false,
};

type NavState = Parameters<NonNullable<PropType<NavigationContainerProps, 'onStateChange'>>>[0];

// Gets the current screen from navigation state
const getActiveRouteName: (state: NavState) => string | undefined = (state) => {
  const route = state?.routes[state.index];

  if (route?.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state as any);
  }

  return route?.name;
};

const App = () => {
  useEffect(() => {
    ACPAnalytics.extensionVersion().then((version) =>
      console.log('AdobeExperienceSDK: ACPAnalytics version: ' + version),
    );
  }, []);

  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('addNotificationReceivedListener', notification);
      setTimeout(() => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
      }, 2000);
    });
    return () => subscription.remove();
  }, []);

  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request; //.content.data.url;
      console.log('addNotificationResponseReceivedListener', url);
    });
    return () => subscription.remove();
  }, []);

  React.useEffect(() => {
    crashlytics().log('App mounted.');
    // crashlytics().crash();
    Notifications.requestPermissionsAsync();
    Notifications.getPermissionsAsync().then(console.log);
  }, []);

  const routeNameRef = React.useRef<string | undefined>(undefined);
  const navigationRef = React.useRef<Ref<NavigationContainerRef>>(null);

  return (
    <>
      <AppStateManager />
      <ActionSheetProvider>
        <ReactQueryConfigProvider config={queryConfig}>
          <PaperProvider theme={theme}>
            <NavigationContainer
              ref={navigationRef as any}
              onStateChange={(state) => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = getActiveRouteName(state);

                if (previousRouteName !== currentRouteName && currentRouteName) {
                  ACPCore.trackState(currentRouteName, {'gov.cdc.appname': 'CDC Health IQ'});
                  crashlytics().log(currentRouteName);
                }

                // Save the current route name for later comparision
                routeNameRef.current = currentRouteName;
              }}>
              <I18nextProvider i18n={i18next}>
                <Navigator />
              </I18nextProvider>
            </NavigationContainer>
          </PaperProvider>
        </ReactQueryConfigProvider>
      </ActionSheetProvider>
    </>
  );
};

export default App;
