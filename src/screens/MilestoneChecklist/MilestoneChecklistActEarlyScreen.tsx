import {DrawerNavigationProp} from '@react-navigation/drawer';
import React from 'react';
import {View} from 'react-native';

import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DashboardDrawerParamsList} from '../../components/Navigator/types';
import {colors} from '../../resources/constants';
import {trackInteractionByType} from '../../utils/analytics';
import ActEarlyPage from './ActEarlyPage';

type NavProp = DrawerNavigationProp<DashboardDrawerParamsList, 'WhenToActEarly'>;

const MilestoneChecklistActEarlyScreen: React.FC<{navigation: NavProp}> = ({navigation}) => {
  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <ActEarlyPage
        onChildSummaryPress={() => {
          trackInteractionByType('My Child Summary');
          navigation.navigate('ChildSummaryStack');
        }}
      />
    </View>
  );
};

export default MilestoneChecklistActEarlyScreen;
