import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
import {createStackNavigator} from '@react-navigation/stack';
import AddChildScreen from '../../screens/AddChildScreen';
import {DashboardStackParamList} from './types';
import BurgerButton from '../BurgerButton';
import NotificationsBadge from '../NotificationsBadge';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStack: FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Dashboard'}
        component={DashboardScreen}
        options={() => ({
          title: t('dashboard:title'),
          headerTransparent: true,
          headerLeft: () => <BurgerButton />,
          headerRight: () => <NotificationsBadge />,
        })}
      />
      <Stack.Screen
        name={'AddChild'}
        component={AddChildScreen}
        options={{
          title: t('addChild:title'),
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
