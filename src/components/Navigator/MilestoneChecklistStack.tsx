import React from 'react';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from './types';
import BurgerButton from '../BurgerButton';
import MilestoneChecklistScreen from '../../screens/MilestoneChecklist/MilestoneChecklistScreen';
import {colors, sharedScreenOptions} from '../../resources/constants';
import MilestoneChecklistGetStartedScreen from '../../screens/MilestoneChecklist/MilestoneChecklistGetStartedScreen';
import MilestoneChecklistQuickViewScreen from '../../screens/MilestoneChecklist/MilestoneChecklistQuickViewScreen';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import ChildSummaryScreen from '../../screens/ChildSummaryScreen';
import RevisitScreen from '../../screens/RevisitScreen';
import {useTranslation} from 'react-i18next';

const Stack = createStackNavigator<MilestoneCheckListParamList>();

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneQuickViewStack'>,
  StackNavigationProp<MilestoneCheckListParamList>
>;

type MilestoneRouteProp = RouteProp<DashboardDrawerParamsList, 'MilestoneQuickViewStack'>;

const MilestoneChecklistStack: React.FC<{route: MilestoneRouteProp; navigation: NavigationProp}> = (props) => {
  const initialRouteName = props.route.params?.initialRouteName;
  const {t} = useTranslation();
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
          title: t('milestoneChecklist:milestoneChecklist'),
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklistQuickView'}
        component={MilestoneChecklistQuickViewScreen}
        initialParams={{quickView: props.route.params?.quickView}}
        options={() => ({
          title: t('milestoneChecklist:milestoneChecklist'),
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklist'}
        component={MilestoneChecklistScreen}
        options={() => ({
          title: t('milestoneChecklist:milestoneChecklist'),
          headerLeft: () => <BurgerButton />,
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
            title: t('milestoneChecklist:milestoneChecklist'),
            backgroundColor: colors.iceCold,
          },
          headerBackTitle: ' ',
        })}
      />
    </Stack.Navigator>
  );
};

export default MilestoneChecklistStack;
