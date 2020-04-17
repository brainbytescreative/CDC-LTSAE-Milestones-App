import {createStackNavigator} from '@react-navigation/stack';
import {InfoParamList} from './types';
import React from 'react';
import BurgerButton from '../BurgerButton';
import InfoScreen from '../../screens/InfoScreen';

const Stack = createStackNavigator<InfoParamList>();

const InfoStack: React.FC<{}> = () => {
  // const {t} = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Info'}
        component={InfoScreen}
        options={() => ({
          title: ' ',
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default InfoStack;
