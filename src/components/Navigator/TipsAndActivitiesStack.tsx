import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {useTranslation} from 'react-i18next';

import TipsAndActivitiesScreen from '../../screens/TipsAndActivitiesScreen/TipsAndActivitiesScreen';
import BurgerButton from '../BurgerButton';
import {TipsAndActivitiesParamList} from './types';

const Stack = createStackNavigator<TipsAndActivitiesParamList>();

const TipsAndActivitiesStack: React.FC = () => {
  const {t} = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'TipsAndActivities'}
        component={TipsAndActivitiesScreen}
        options={() => ({
          title: t('tipsAndActivities:title'),
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default TipsAndActivitiesStack;
