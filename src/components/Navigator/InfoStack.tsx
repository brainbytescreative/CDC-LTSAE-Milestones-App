import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import InfoScreen from '../../screens/InfoScreen';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicyScreen';
import BurgerButton from '../BurgerButton';
import {InfoStackParamList} from './types';

const Stack = createStackNavigator<InfoStackParamList>();

const InfoStack: React.FC = () => {
  const {t} = useTranslation();
  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen
        name={'Info'}
        component={InfoScreen}
        options={() => ({
          title: t('info:title'),
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerTitleStyle: {
            ...sharedStyle.largeBoldText,
          },
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'PrivacyPolicy'}
        component={PrivacyPolicyScreen}
        options={() => ({
          title: t('privacyPolicy:title'),
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerTitleStyle: {
            ...sharedStyle.largeBoldText,
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default InfoStack;
