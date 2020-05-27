import {createStackNavigator} from '@react-navigation/stack';
import {InfoParamList} from './types';
import React from 'react';
import BurgerButton from '../BurgerButton';
import InfoScreen from '../../screens/InfoScreen';
import {useTranslation} from 'react-i18next';
import {colors} from '../../resources/constants';

const Stack = createStackNavigator<InfoParamList>();

const InfoStack: React.FC = () => {
  const {t} = useTranslation('info');
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Info'}
        component={InfoScreen}
        options={() => ({
          title: t('title'),
          headerStyle: {
            backgroundColor: colors.iceCold,
          },
          headerTitleStyle: {
            fontSize: 22,
            fontFamily: 'Montserrat-Bold',
          },
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default InfoStack;
