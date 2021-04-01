import crashlytics from '@react-native-firebase/crashlytics';
import {NavigationContainerRef} from '@react-navigation/core';
import {createStackNavigator} from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import React from 'react';
import {I18nextProvider} from 'react-i18next';
import {queryCache, useQuery} from 'react-query';

import {initialize} from '../../db';
import {DowngradeError} from '../../db/SQLiteClient';
import {useTransferDataFromOldDb} from '../../hooks/migrationHooks';
import {useNavigateNotification} from '../../hooks/notificationsHooks';
import {useGetOnboarding} from '../../hooks/onboardingHooks';
import i18next from '../../resources/l18n';
import AddChildScreen from '../../screens/AddChildScreen';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import {slowdown} from '../../utils/helpers';
import AppStateManager from '../AppStateManager';
import ErrorBoundary from '../ErrorBoundary';
import withSuspense from '../withSuspense';
import RootDrawer from './RootDrawer';
import {RootStackParamList} from './types';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC<{navigation: NavigationContainerRef | null}> = ({navigation}) => {
  const {data: isOnboarded} = useGetOnboarding();
  // const [, setLoading] = useState(true);
  const [navigateNotification] = useNavigateNotification();
  const [transferDataFromOldDb] = useTransferDataFromOldDb();

  useQuery(
    'dbConnect',
    async () => {
      await initialize()
        .then(() => {
          return transferDataFromOldDb({force: false});
        })
        .catch((err) => {
          // todo implement error handling
          if (err instanceof DowngradeError) {
            // setErrorMessage('Downgrade error');
          } else {
            // setErrorMessage('Unexpected error');
          }
          // setError(true);
          // setLoading(false);
          crashlytics().recordError(err);
          // setLoading(false);
        });
    },
    {suspense: true},
  );

  // useQuery(
  //   'translations',
  //   async () => {
  //     await Promise.all(
  //       [
  //         {lng: 'en', key: 'jShrt63tWG-vKZnFfrYDje0B_uGhs-5G'},
  //         {lng: 'es', key: 'jShrt63tWG-vKZnFfrYDje0B_uGhs-5G'},
  //         {lng: 'en', key: 'fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg'},
  //         {lng: 'es', key: 'fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg'},
  //       ].map(async ({lng, key}) => {
  //         const response = await Axios.get<Record<string, Record<string, string> | undefined> | undefined>(
  //           `https://localise.biz/api/export/locale/${lng}.json?index=id&format=i18next3&fallback=en&order=id&key=${key}`,
  //         );
  //         _.isObject(response?.data) &&
  //           Object.keys(response.data).forEach((ns) => {
  //             i18next.addResources(lng, ns, response?.data?.[ns]);
  //           });
  //       }),
  //     );
  //   },
  //   {suspense: true},
  // );

  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((data) => {
      // trackNotificationById(data.request.identifier);
      setTimeout(() => {
        queryCache.invalidateQueries('unreadNotifications');
      }, 2000);
    });
    return () => subscription.remove();
  }, []);

  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      await slowdown(Promise.resolve(), 1000);
      navigateNotification(response.notification.request.identifier, false);
    });
    return () => subscription.remove();
  }, [navigation, navigateNotification]);

  // const isOnboarded = data; //data;
  return (
    <I18nextProvider i18n={i18next}>
      <ErrorBoundary>
        <Stack.Navigator headerMode={'none'}>
          {!isOnboarded && (
            <>
              <Stack.Screen name={'OnboardingInfo'} component={OnboardingInfoScreen} />
              <Stack.Screen name={'OnboardingParentProfile'} component={OnboardingParentProfileScreen} />
              <Stack.Screen name={'AddChild'} initialParams={{onboarding: true}} component={AddChildScreen} />
              <Stack.Screen
                name={'OnboardingHowToUse'}
                component={OnboardingHowToUseScreen}
                options={{gestureEnabled: false}}
              />
            </>
          )}
          <Stack.Screen name={'Dashboard'} component={RootDrawer} />
        </Stack.Navigator>
        <AppStateManager />
      </ErrorBoundary>
    </I18nextProvider>
  );
};

export default withSuspense(Navigator);
