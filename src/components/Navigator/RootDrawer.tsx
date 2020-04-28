import React from 'react';
import {useTranslation} from 'react-i18next';
import DashboardStack from './DashboardStack';
import SettingsStack from './SettingsStack';
import TipsAndActivitiesStack from './TipsAndActivitiesStack';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentOptions,
  DrawerItemList,
} from '@react-navigation/drawer';
import {DashboardDrawerParamsList} from './types';
import InfoStack from './InfoStack';
import ChildSummaryStack from './ChildSummaryStack';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {colors} from '../../resources/constants';
import {Text} from 'react-native-paper';
import MilestoneChecklistStack from './MilestoneChecklistStack';

const Drawer = createDrawerNavigator<DashboardDrawerParamsList>();

const DefaultDrawer: React.FC<DrawerContentComponentProps<DrawerContentOptions>> = (props) => {
  return (
    <ScrollView>
      <SafeAreaView>
        <View
          style={{
            backgroundColor: colors.purple,
            marginHorizontal: 32,
            borderRadius: 10,
            marginVertical: 60,
          }}>
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
              Menu
            </Text>
          </View>
          <DrawerItemList {...props} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const RootDrawer: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Drawer.Navigator
      drawerContent={DefaultDrawer}
      drawerStyle={{width: '100%', backgroundColor: 'transparent'}}
      initialRouteName={'DashboardStack'}>
      <Drawer.Screen
        name={'DashboardStack'}
        options={{
          drawerLabel: t('dashboard:drawerLabel'),
        }}
        component={DashboardStack}
      />
      <Drawer.Screen
        name={'MilestoneChecklistStack'}
        options={{
          drawerLabel: t('milestoneChecklist:drawerLabel'),
        }}
        component={MilestoneChecklistStack}
      />
      <Drawer.Screen
        name={'SettingsStack'}
        options={{
          drawerLabel: t('settings:drawerLabel'),
        }}
        component={SettingsStack}
      />
      <Drawer.Screen
        name={'TipsAndActivitiesStack'}
        options={{
          drawerLabel: t('tipsAndActivities:drawerLabel'),
        }}
        component={TipsAndActivitiesStack}
      />
      <Drawer.Screen
        name={'InfoStack'}
        options={{
          drawerLabel: t('info:drawerLabel'),
        }}
        component={InfoStack}
      />
      <Drawer.Screen
        name={'ChildSummaryStack'}
        options={{
          drawerLabel: t('childSummary:drawerLabel'),
        }}
        component={ChildSummaryStack}
      />
    </Drawer.Navigator>
  );
};

export default RootDrawer;
