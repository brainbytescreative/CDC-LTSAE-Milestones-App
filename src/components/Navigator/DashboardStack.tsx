import {HeaderBackButton, createStackNavigator} from '@react-navigation/stack';
import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';

import {colors, sharedScreenOptions} from '../../resources/constants';
import AddAppointmentScreen from '../../screens/AddAppointmentScreen';
import AddChildScreen from '../../screens/AddChildScreen';
import AppointmentScreen from '../../screens/AppointmentScreen';
import ChildSummaryScreen from '../../screens/ChildSummaryScreen';
import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
import WhenActEarlyScreen from '../../screens/Dashboard/WhenActEarlyScreen';
import RevisitScreen from '../../screens/RevisitScreen';
import TipsAndActivitiesScreen from '../../screens/TipsAndActivitiesScreen/TipsAndActivitiesScreen';
import {trackSelectByType} from '../../utils/analytics';
import BurgerButton from '../BurgerButton';
import {DashboardStackParamList} from './types';

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
        options={(screenProps) => ({
          title: t('addAppointment:title'),
          headerBackTitle: ' ',
          headerLeft: () => (
            <HeaderBackButton
              tintColor={colors.black}
              label={' '}
              onPress={() => {
                trackSelectByType('Back', {page: 'Add Appointment'});
                screenProps.navigation?.goBack?.();
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name={'Appointment'}
        component={AppointmentScreen}
        options={(screenProps) => ({
          title: t('appointment:title'),
          headerBackTitle: ' ',
          headerLeft: () => (
            <HeaderBackButton
              tintColor={colors.black}
              label={' '}
              onPress={() => {
                trackSelectByType('Back', {page: 'Appointment'});
                screenProps.navigation?.goBack?.();
              }}
            />
          ),
        })}
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
