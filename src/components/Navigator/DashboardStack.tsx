import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
import {createStackNavigator} from '@react-navigation/stack';
import AddChildScreen from '../../screens/AddChildScreen';
import {DashboardStackParamList} from './types';
import BurgerButton from '../BurgerButton';
import AddAppointmentScreen from '../../screens/AddAppointmentScreen';
import AppointmentScreen from '../../screens/AppointmentScreen';
import ChildSummaryScreen from '../../screens/ChildSummaryScreen';
import TipsAndActivitiesScreen from '../../screens/TipsAndActivitiesScreen/TipsAndActivitiesScreen';
import {colors, sharedScreenOptions} from '../../resources/constants';
import RevisitScreen from '../../screens/RevisitScreen';
import WhenActEarlyScreen from '../../screens/Dashboard/WhenActEarlyScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardStack: FC = () => {
  const {t} = useTranslation();

  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen
        name={'Dashboard'}
        component={DashboardScreen}
        options={() => ({
          title: t('dashboard:title'),
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'AddChild'}
        component={AddChildScreen}
        options={{
          header: () => null,
        }}
      />
      <Stack.Screen
        name={'AddAppointment'}
        component={AddAppointmentScreen}
        options={{
          title: t('addAppointment:title'),
          headerBackTitle: ' ',
        }}
      />
      <Stack.Screen
        name={'Appointment'}
        component={AppointmentScreen}
        options={{
          title: t('appointment:title'),
          headerBackTitle: ' ',
        }}
      />
      {/*<Stack.Screen*/}
      {/*  name={'MilestoneChecklist'}*/}
      {/*  component={MilestoneChecklistScreen}*/}
      {/*  options={{*/}
      {/*    title: t('milestoneChecklistScreen:title'),*/}
      {/*    headerBackTitle: ' ',*/}
      {/*  }}*/}
      {/*/>*/}

      <Stack.Screen
        name={'TipsAndActivities'}
        component={TipsAndActivitiesScreen}
        options={() => ({
          title: t('tipsAndActivities:title'),
          headerBackTitle: ' ',
        })}
      />

      <Stack.Screen
        name={'WhenActEarly'}
        component={WhenActEarlyScreen}
        options={() => ({
          headerBackTitle: ' ',
        })}
      />

      <Stack.Screen
        name={'ChildSummary'}
        component={ChildSummaryScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerBackTitle: ' ',
        })}
      />
      <Stack.Screen
        name={'Revisit'}
        component={RevisitScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerBackTitle: ' ',
        })}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
