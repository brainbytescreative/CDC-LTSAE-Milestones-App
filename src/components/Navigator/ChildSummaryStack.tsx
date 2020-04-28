import React from 'react';
import BurgerButton from '../BurgerButton';
import {createStackNavigator} from '@react-navigation/stack';
import {ChildSummaryParamList} from './types';
import {useTranslation} from 'react-i18next';
import ChildSummaryScreen from '../../screens/ChildSummaryScreen';
import {colors} from '../../resources/constants';

const Stack = createStackNavigator<ChildSummaryParamList>();

const ChildSummaryStack: React.FC<{}> = () => {
  const {t} = useTranslation();
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
    </Stack.Navigator>
  );
};

export default ChildSummaryStack;
