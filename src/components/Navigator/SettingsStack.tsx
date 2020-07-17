import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import SettingsScreen from '../../screens/SettingsScreen';
import BurgerButton from '../BurgerButton';
import {SettingsStackParamList} from './types';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'NotificationSettings'}
        component={SettingsScreen}
        options={() => ({
          title: '',
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;
