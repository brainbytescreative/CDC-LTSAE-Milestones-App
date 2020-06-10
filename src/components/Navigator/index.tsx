import React, {useEffect, useState} from 'react';
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

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC = () => {
  const {data: isOnboarded} = useGetOnboarding();
  // const [, setLoading] = useState(true);

  useEffect(() => {
    initialize()
      .then(() => {
        // setLoading(false);
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
        // console.warn(err);
        crashlytics().recordError(err);
        // setLoading(false);
      });
  });

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
