import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {colors} from '../../resources/constants';
import ChildSummaryScreen from '../../screens/ChildSummaryScreen';
import RevisitScreen from '../../screens/RevisitScreen';
import BurgerButton from '../BurgerButton';
import {ChildSummaryParamList} from './types';

const Stack = createStackNavigator<ChildSummaryParamList>();

const ChildSummaryStack: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'ChildSummary'}
        component={ChildSummaryScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerLeft: () => <BurgerButton />,
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
          // headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default ChildSummaryStack;
