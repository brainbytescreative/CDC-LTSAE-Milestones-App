import React from 'react';
import ActEarlyPage from './ActEarlyPage';
import {View} from 'react-native';
import {colors} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList} from '../../components/Navigator/types';

type NavProp = DrawerNavigationProp<DashboardDrawerParamsList, 'WhenToActEarly'>;

const MilestoneChecklistActEarlyScreen: React.FC<{navigation: NavProp}> = ({navigation}) => {
  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <ActEarlyPage
        onChildSummaryPress={() => {
          navigation.navigate('ChildSummaryStack');
        }}
      />
    </View>
  );
};

export default MilestoneChecklistActEarlyScreen;