import React from 'react';
import {FlatList, View} from 'react-native';
import OverviewPage from './OverviewPage';
import {useGetMilestone, useGetSectionsProgress} from '../../hooks/checklistHooks';
import {checklistSections, colors} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import SectionItem from './SectionItem';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneChecklistStack'>,
  StackNavigationProp<MilestoneCheckListParamList>
>;

type MilestoneRouteProp = RouteProp<MilestoneCheckListParamList, 'MilestoneChecklistQuickView'>;

const MilestoneChecklistQuickViewScreen: React.FC<{
  navigation: NavigationProp;
  route: MilestoneRouteProp;
}> = ({navigation, route}) => {
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {progress: sectionsProgress} = useGetSectionsProgress();

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          data={checklistSections}
          horizontal={true}
          renderItem={({item}) => <SectionItem progress={sectionsProgress?.get(item)} section={item} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      <OverviewPage
        milestoneAge={milestoneAge}
        milestoneAgeFormatted={milestoneAgeFormatted}
        onNext={() => {
          if (route.params?.quickView) {
            navigation.navigate('MilestoneChecklistStack');
          } else {
            navigation.navigate('MilestoneChecklist');
          }
        }}
      />
    </View>
  );
};

export default MilestoneChecklistQuickViewScreen;
