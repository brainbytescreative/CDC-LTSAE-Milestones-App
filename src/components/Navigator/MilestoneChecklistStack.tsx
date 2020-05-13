import React from 'react';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from './types';
import BurgerButton from '../BurgerButton';
import MilestoneChecklistScreen from '../../screens/MilestoneChecklist/MilestoneChecklistScreen';
import {sharedScreenOptions} from '../../resources/constants';
import MilestoneChecklistGetStartedScreen from '../../screens/MilestoneChecklist/MilestoneChecklistGetStartedScreen';
import MilestoneChecklistQuickViewScreen from '../../screens/MilestoneChecklist/MilestoneChecklistQuickViewScreen';
import {DrawerNavigationProp} from '@react-navigation/drawer';

const Stack = createStackNavigator<MilestoneCheckListParamList>();

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneQuickViewStack'>,
  StackNavigationProp<MilestoneCheckListParamList>
>;

type MilestoneRouteProp = RouteProp<DashboardDrawerParamsList, 'MilestoneQuickViewStack'>;

const MilestoneChecklistStack: React.FC<{route: MilestoneRouteProp; navigation: NavigationProp}> = (props) => {
  const initialRouteName = props.route.params?.initialRouteName;

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        ...sharedScreenOptions,
      }}>
      <Stack.Screen
        name={'MilestoneChecklistGetStarted'}
        component={MilestoneChecklistGetStartedScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklistQuickView'}
        component={MilestoneChecklistQuickViewScreen}
        initialParams={{quickView: props.route.params?.quickView}}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklist'}
        component={MilestoneChecklistScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default MilestoneChecklistStack;
