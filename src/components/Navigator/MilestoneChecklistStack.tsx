import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {MilestoneCheckListParamList} from './types';
import BurgerButton from '../BurgerButton';
import MilestoneChecklistScreen from '../../screens/MilestoneChecklistScreen/MilestoneChecklistScreen';
import {colors} from '../../resources/constants';

const Stack = createStackNavigator<MilestoneCheckListParamList>();

const MilestoneChecklistStack: React.FC<{}> = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'MilestoneChecklist'}
        component={MilestoneChecklistScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default MilestoneChecklistStack;
