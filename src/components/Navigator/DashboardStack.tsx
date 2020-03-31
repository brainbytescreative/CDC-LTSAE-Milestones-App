import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {routeKeys} from '../../resources/constants';
import Dashboard from '../../screens/Dashboard';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {DrawerActions} from '@react-navigation/native';
import {BurgerIcon} from '../../resources/svg';

const Stack = createStackNavigator();

const DashboardStack: FC<{}> = (props) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={routeKeys.Dashboard}
        component={Dashboard}
        options={() => ({
          title: t('dashboard:title'),
          headerTransparent: true,
          headerTitle: () => {
            return (
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'montserrat',
                    fontSize: 22,
                    fontWeight: 'bold',
                  }}>
                  Child name
                </Text>
                <EvilIcons name={'chevron-down'} size={30} />
              </TouchableOpacity>
            );
          },
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
    </Stack.Navigator>
  );
};

export default DashboardStack;
