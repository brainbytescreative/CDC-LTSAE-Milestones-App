import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {routeKeys} from '../../resources/constants';
import DashboardScreen from '../../screens/Dashboard/DashboardScreen';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {BurgerIcon} from '../../resources/svg';
import AddChildScreen from '../../screens/AddChildScreen';

const Stack = createStackNavigator();

export type DashboardStackParamList = {
  AddChild: {childId: string | number | undefined; anotherChild: boolean | undefined} | undefined;
  Dashboard: undefined;
};

const DashboardStack: FC<{}> = (props) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routeKeys.Dashboard}
        component={DashboardScreen}
        options={() => ({
          title: t('dashboard:title'),
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(DrawerActions.toggleDrawer());
              }}
              style={{paddingHorizontal: 32}}>
              <BurgerIcon />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                width: 23,
                height: 23,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 32,
              }}>
              <Text
                style={{
                  fontFamily: 'montserrat',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                4
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name={routeKeys.AddChild}
        component={AddChildScreen}
        options={{
          title: t('addChild:title'),
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
