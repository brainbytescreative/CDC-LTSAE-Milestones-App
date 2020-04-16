import {createStackNavigator} from '@react-navigation/stack';
import {InfoParamList, TipsAndActivitiesParamList} from './types';
import React from 'react';
import BurgerButton from '../BurgerButton';
import NotificationsBadge from '../NotificationsBadge';
import {useTranslation} from 'react-i18next';
import InfoScreen from '../../screens/InfoScreen';

const Stack = createStackNavigator<InfoParamList>();

const InfoStack: React.FC<{}> = () => {
  const {t} = useTranslation();
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
