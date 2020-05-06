import React from 'react';
import {useTranslation} from 'react-i18next';
import DashboardStack from './DashboardStack';
import SettingsStack from './SettingsStack';
import TipsAndActivitiesStack from './TipsAndActivitiesStack';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {DashboardDrawerParamsList} from './types';
import InfoStack from './InfoStack';
import ChildSummaryStack from './ChildSummaryStack';
import {SafeAreaView, TouchableOpacity, View} from 'react-native';
import {colors, sharedStyle} from '../../resources/constants';
import {Text} from 'react-native-paper';
import MilestoneChecklistStack from './MilestoneChecklistStack';
import CloseCross from '../../resources/svg/CloseCross';
import i18next from 'i18next';
import {DrawerContentOptions} from '@react-navigation/drawer/src/types';
import {useNavigation} from '@react-navigation/native';

const Drawer = createDrawerNavigator<DashboardDrawerParamsList>();

const DefaultDrawer: React.FC<DrawerContentComponentProps<DrawerContentOptions>> = (props) => {
  // const navigation = useNavigation<DrawerNavigationProp<DashboardDrawerParamsList>>();

  return (
    <DrawerContentScrollView {...props}>
      <SafeAreaView>
        <View
          style={{
            backgroundColor: colors.purple,
            marginHorizontal: 32,
            borderRadius: 10,
            marginVertical: 60,
            paddingBottom: 19,
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
              {i18next.t('common:menu')}
            </Text>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 0,
                paddingVertical: 25,
                paddingHorizontal: 32,
                justifyContent: 'center',
              }}
              onPress={() => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                props.navigation.closeDrawer();
              }}>
              <CloseCross />
            </TouchableOpacity>
          </View>
          <DrawerItemList
            itemStyle={[
              {
                backgroundColor: colors.white,
                marginHorizontal: 16,
                borderRadius: 10,
                marginTop: 0,
                marginBottom: 12,
                overflow: 'visible',
              },
              sharedStyle.shadow,
            ]}
            labelStyle={{
              marginHorizontal: 8,
              fontSize: 18,
              fontFamily: 'Montserrat-Regular',
              fontWeight: 'normal',
            }}
            {...props}
          />
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
};

const RootDrawer: React.FC<{}> = () => {
  const {t} = useTranslation();
  return (
    <Drawer.Navigator
      drawerContent={(contentProps) => <DefaultDrawer {...contentProps} />}
      overlayColor={colors.whiteTransparent}
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
        name={'TipsAndActivitiesStack'}
        options={{
          drawerLabel: t('tipsAndActivities:drawerLabel'),
        }}
        component={TipsAndActivitiesStack}
      />
      <Drawer.Screen
        name={'ChildSummaryStack'}
        options={{
          drawerLabel: t('childSummary:drawerLabel'),
        }}
        component={ChildSummaryStack}
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
