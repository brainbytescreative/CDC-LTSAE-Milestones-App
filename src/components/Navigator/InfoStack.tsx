import {createStackNavigator} from '@react-navigation/stack';
import {InfoStackParamList} from './types';
import React from 'react';
import BurgerButton from '../BurgerButton';
import InfoScreen from '../../screens/InfoScreen';
import {useTranslation} from 'react-i18next';
import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicyScreen';

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
