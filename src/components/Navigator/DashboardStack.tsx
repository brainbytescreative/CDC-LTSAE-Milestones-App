import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
import {createStackNavigator} from '@react-navigation/stack';
import AddChildScreen from '../../screens/AddChildScreen';
import {DashboardStackParamList} from './types';
import BurgerButton from '../BurgerButton';
import NotificationsBadge from '../NotificationsBadge';
import AddAppointmentScreen from '../../screens/AddAppointmentScreen';
import AppointmentScreen from '../../screens/AppointmentScreen';
import MilestoneChecklistScreen from '../../screens/MilestoneChecklistScreen/MilestoneChecklistScreen';

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
      <Stack.Screen
        name={'AddAppointment'}
        component={AddAppointmentScreen}
        options={{
          title: t('addAppointment:title'),
          headerBackTitle: ' ',
          headerRight: () => <NotificationsBadge />,
        }}
      />
      <Stack.Screen
        name={'Appointment'}
        component={AppointmentScreen}
        options={{
          title: t('appointment:title'),
          headerBackTitle: ' ',
          headerRight: () => <NotificationsBadge />,
        }}
      />
      <Stack.Screen
        name={'MilestoneChecklist'}
        component={MilestoneChecklistScreen}
        options={{
          title: t('milestoneChecklistScreen:title'),
          headerBackTitle: ' ',
          headerRight: () => <NotificationsBadge />,
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
