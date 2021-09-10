import {DrawerContentComponentProps, DrawerContentScrollView, createDrawerNavigator} from '@react-navigation/drawer';
import i18next from 'i18next';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../../resources/constants';
import {trackDrawerSelect} from '../../utils/analytics';
import CloseCross from '../Svg/CloseCross';
import ChildSummaryStack from './ChildSummaryStack';
import DashboardStack from './DashboardStack';
import InfoStack from './InfoStack';
import MilestoneChecklistStack from './MilestoneChecklistStack';
import SettingsStack from './SettingsStack';
import TipsAndActivitiesStack from './TipsAndActivitiesStack';
import {DashboardDrawerParamsList} from './types';
import WhenActEarlyStack from './WhenActEarlyStack';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {tOpt} from '../../utils/helpers';

const Drawer = createDrawerNavigator<DashboardDrawerParamsList>();

const DefaultDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  // const navigation = useNavigation<DrawerNavigationProp<DashboardDrawerParamsList>>();
  const {t} = useTranslation();
  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView>
        <View
          style={[
            {
              backgroundColor: colors.purple,
              marginHorizontal: 32,
              borderRadius: 10,
              marginVertical: 60,
              paddingBottom: 19,
            },
            sharedStyle.shadow,
          ]}>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: 22,
                textAlign: 'center',
                marginTop: 16,
                marginBottom: 35,
                flexGrow: 1,
                fontFamily: 'Montserrat-Bold',
              }}>
              {i18next.t('common:menu')}
            </Text>
            <TouchableOpacity
              accessibilityLabel={t('accessibility:closeMainMenu')}
              style={{
                position: 'absolute',
                right: 0,
                paddingVertical: 25,
                paddingHorizontal: 32,
                justifyContent: 'center',
              }}
              onPress={() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                props.navigation.closeDrawer();
              }}>
              <CloseCross />
            </TouchableOpacity>
          </View>
          {props.state.routes.map(({name, params, key}: any, index) => {
            return (
              <View
                key={key}
                style={[
                  {
                    backgroundColor: colors.white,
                    marginHorizontal: 16,
                    borderRadius: 10,
                    marginTop: 0,
                    marginBottom: 12,
                    overflow: 'visible',
                  },
                  sharedStyle.shadow,
                ]}>
                <TouchableOpacity
                  accessibilityRole={'menuitem'}
                  style={{paddingHorizontal: 16, paddingVertical: 12}}
                  onPress={() => {
                    if (params?.redirect) {
                      props.navigation.navigate(...params.redirect);
                    } else {
                      props.navigation.navigate(name, {
                        params: {},
                      });
                    }

                    trackDrawerSelect(name);
                  }}>
                  <Text
                    style={[
                      {
                        fontSize: 18,
                      },
                      index === props.state.index && {color: colors.purple},
                    ]}>
                    {props.descriptors[key].options.drawerLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
};

const Stub: React.FC = () => {
  return null;
};

const RootDrawer: React.FC = () => {
  const {t} = useTranslation();
  const {data: child} = useGetCurrentChild();
  return (
    <Drawer.Navigator
      drawerContent={(contentProps) => <DefaultDrawer {...contentProps} />}
      overlayColor={colors.whiteTransparent}
      drawerStyle={{width: '100%', backgroundColor: 'transparent'}}
      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
      }}
      initialRouteName={'DashboardStack'}>
      <Drawer.Screen
        name={'DashboardStack'}
        options={{
          drawerLabel: t('dashboard:drawerLabel'),
        }}
        component={DashboardStack}
      />
      <Drawer.Screen
        name={'AddChildStub'}
        options={{
          drawerLabel: t('addChild:drawerLabel'),
        }}
        initialParams={{
          redirect: [
            'DashboardStack',
            {
              screen: 'Dashboard',
              params: {
                addChild: true,
              },
            },
          ],
        }}
        component={Stub}
      />
      <Drawer.Screen
        name={'MilestoneChecklistStack'}
        options={{
          unmountOnBlur: true,
          drawerLabel: t('milestoneChecklist:drawerLabel'),
        }}
        component={MilestoneChecklistStack}
      />
      <Drawer.Screen
        name={'WhenToActEarly'}
        options={{
          unmountOnBlur: true,
          drawerLabel: t('milestoneChecklist:whenToActEarly'),
        }}
        component={WhenActEarlyStack}
      />
      <Drawer.Screen
        name={'ChildSummaryStack'}
        options={{
          drawerLabel: t('childSummary:drawerLabel', tOpt({t, gender: child?.gender})),
        }}
        component={ChildSummaryStack}
      />
      <Drawer.Screen
        name={'TipsAndActivitiesStack'}
        options={{
          unmountOnBlur: true,
          drawerLabel: t('tipsAndActivities:drawerLabel'),
        }}
        component={TipsAndActivitiesStack}
      />
      <Drawer.Screen
        name={'MilestoneQuickViewStack'}
        options={{
          drawerLabel: t('milestoneChecklist:milestoneQuickView'),
        }}
        initialParams={{initialRouteName: 'MilestoneChecklistQuickView', quickView: true}}
        component={MilestoneChecklistStack}
      />
      <Drawer.Screen
        name={'AppointmentsStub'}
        options={{
          drawerLabel: t('dashboard:appointments'),
        }}
        initialParams={{
          redirect: [
            'DashboardStack',
            {
              screen: 'Dashboard',
              params: {
                appointments: true,
              },
            },
          ],
        }}
        component={Stub}
      />
      <Drawer.Screen
        name={'SettingsStack'}
        options={{
          drawerLabel: t('settings:drawerLabel'),
        }}
        component={SettingsStack}
      />
      <Drawer.Screen
        name={'InfoStack'}
        options={{
          drawerLabel: t('info:drawerLabel'),
        }}
        component={InfoStack}
      />
    </Drawer.Navigator>
  );
};

export default RootDrawer;
