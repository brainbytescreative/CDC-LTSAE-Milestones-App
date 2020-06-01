import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import OverviewPage from './OverviewPage';
import {useGetMilestone, useGetSectionsProgress} from '../../hooks/checklistHooks';
import {checklistSections, colors, skillTypes} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import SectionItem, {Section} from './SectionItem';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import _ from 'lodash';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneChecklistStack'>,
  StackNavigationProp<MilestoneCheckListParamList>
>;

type MilestoneRouteProp = RouteProp<MilestoneCheckListParamList, 'MilestoneChecklistQuickView'>;

const MilestoneChecklistQuickViewScreen: React.FC<{
  navigation: NavigationProp;
  route: MilestoneRouteProp;
}> = () => {
  const [section, setSection] = useState<Section>(skillTypes[0]);
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  // const {data: {id: childId} = {}} = useGetCurrentChild();

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={checklistSections}
          horizontal={true}
          renderItem={({item}) => <SectionItem section={item} selectedSection={section} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      <OverviewPage
        section={section}
        milestoneAge={milestoneAge}
        milestoneAgeFormatted={milestoneAgeFormatted}
        onNext={() => {
          // if (route.params?.quickView) {
          //   navigation.navigate('MilestoneChecklistStack');
          // } else {
          //   navigation.navigate('MilestoneChecklist');
          // }
          if (section === _.last(skillTypes)) {
            setSection(skillTypes[0]);
          } else {
            setSection(skillTypes[skillTypes.indexOf(section) + 1]);
            // navigation.navigate('MilestoneChecklistStack');
          }
        }}
      />
    </View>
  );
};

export default MilestoneChecklistQuickViewScreen;
