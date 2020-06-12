import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {RootStackParamList} from './types';
import RootDrawer from './RootDrawer';
import {useGetOnboarding} from '../../hooks/onboardingHooks';
import {initialize} from '../../db';
import {DowngradeError} from '../../db/SQLiteClient';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import AddChildScreen from '../../screens/AddChildScreen';
import withSuspense from '../withSuspense';
import ErrorBoundary from '../ErrorBoundary';
import crashlytics from '@react-native-firebase/crashlytics';
import {queryCache, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {useNavigateNotification} from '../../hooks/notificationsHooks';
import {NavigationContainerRef} from '@react-navigation/core';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC<{navigation: NavigationContainerRef | null}> = ({navigation}) => {
  const {data: isOnboarded} = useGetOnboarding();
  // const [, setLoading] = useState(true);
  const [navigateNotification] = useNavigateNotification();

  useQuery(
    'dbConnect',
    async () => {
      await initialize().catch((err) => {
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
      navigation && navigateNotification(response.notification.request.identifier, navigation);
    });
    return () => subscription.remove();
  }, [navigation, navigateNotification]);

  // const isOnboarded = data; //data;
  return (
    <ErrorBoundary>
      <Stack.Navigator headerMode={'none'}>
        {!isOnboarded && (
          <>
            <Stack.Screen name={'OnboardingInfo'} component={OnboardingInfoScreen} />
            <Stack.Screen name={'OnboardingParentProfile'} component={OnboardingParentProfileScreen} />
            <Stack.Screen name={'AddChild'} initialParams={{onboarding: true}} component={AddChildScreen} />
            <Stack.Screen name={'OnboardingHowToUse'} component={OnboardingHowToUseScreen} />
          </>
        )}
        <Stack.Screen name={'Dashboard'} component={RootDrawer} />
      </Stack.Navigator>
    </ErrorBoundary>
  );
};

export default withSuspense(Navigator);
