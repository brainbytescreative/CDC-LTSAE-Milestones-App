import React from 'react';
import {useTranslation} from 'react-i18next';
import DashboardStack from './DashboardStack';
import SettingsStack from './SettingsStack';
import TipsAndActivitiesStack from './TipsAndActivitiesStack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DashboardDrawerParamsList} from './types';
import InfoStack from './InfoStack';
import ChildSummaryStack from './ChildSummaryStack';

const Drawer = createDrawerNavigator<DashboardDrawerParamsList>();

const RootDrawer: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Drawer.Navigator initialRouteName={'DashboardStack'}>
      <Drawer.Screen
        name={'DashboardStack'}
        options={{
          drawerLabel: t('dashboard:drawerLabel'),
        }}
        component={DashboardStack}
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
