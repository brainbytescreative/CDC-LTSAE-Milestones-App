import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from './types';
import RootDrawer from './RootDrawer';
import {useGetOnboarding} from '../../hooks/onboardingHooks';
import {initialize} from '../../db';
import {DowngradeError} from '../../db/SQLiteClient';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import AddChildScreen from '../../screens/AddChildScreen';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator: React.FC<{}> = () => {
  const {t} = useTranslation();
  const {data: isOnboarded, isFetching} = useGetOnboarding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize()
      .then(() => {
        setLoading(false);
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
        console.warn(err);
        setLoading(false);
      });
  });

  // const isOnboarded = data; //data;

  return (
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
  );
};

export default Navigator;
