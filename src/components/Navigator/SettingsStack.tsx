import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {SettingsStackParamList} from './types';
import SettingsScreen from '../../screens/SettingsScreen';
import BurgerButton from '../BurgerButton';
import NotificationsBadge from '../NotificationsBadge';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStack: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'NotificationSettings'}
        component={SettingsScreen}
        options={() => ({
          title: t('settings:title'),
          headerLeft: () => <BurgerButton />,
          headerRight: () => <NotificationsBadge />,
        })}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;
