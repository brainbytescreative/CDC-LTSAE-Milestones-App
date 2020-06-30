import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BurgerButton from '../BurgerButton';
import {sharedScreenOptions} from '../../resources/constants';
import MilestoneChecklistActEarlyScreen from '../../screens/MilestoneChecklist/MilestoneChecklistActEarlyScreen';

const Stack = createStackNavigator();

const WhenActEarlyStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen
        name={'MilestoneChecklistWhenToActEarly'}
        component={MilestoneChecklistActEarlyScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default WhenActEarlyStack;
