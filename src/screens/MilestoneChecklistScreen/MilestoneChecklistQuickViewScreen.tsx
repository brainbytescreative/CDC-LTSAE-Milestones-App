import React from 'react';
import {FlatList, Text, View} from 'react-native';
import OverviewPage from './OverviewPage';
import {useGetMilestone, useGetSectionsProgress} from '../../hooks/checklistHooks';
import {checklistSections, colors} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import SectionItem from './SectionItem';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardStackParamList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklistQuickView'>,
  StackNavigationProp<DashboardStackParamList>
>;

const MilestoneChecklistQuickViewScreen: React.FC<{}> = () => {
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {progress: sectionsProgress, complete} = useGetSectionsProgress();
  const navigation = useNavigation<NavigationProp>();

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
          navigation.navigate('MilestoneChecklist');
        }}
      />
    </View>
  );
};

export default MilestoneChecklistQuickViewScreen;
