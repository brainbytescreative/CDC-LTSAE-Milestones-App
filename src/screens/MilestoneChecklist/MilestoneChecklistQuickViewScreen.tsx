import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import _ from 'lodash';
import React, {useState} from 'react';
import {FlatList, View} from 'react-native';

import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {useGetMilestone} from '../../hooks/checklistHooks';
import {Section, checklistSections, colors, skillTypes} from '../../resources/constants';
import {trackInteractionByType} from '../../utils/analytics';
import OverviewPage from './OverviewPage';
import SectionItem from './SectionItem';

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
  const onSectionSet = (val: Section) => {
    // if (val !== 'actEarly') {
    setSection(val);
    // }
  };

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={checklistSections}
          horizontal={true}
          renderItem={({item}) => <SectionItem onSectionSet={onSectionSet} section={item} selectedSection={section} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      <OverviewPage
        section={section}
        milestoneAge={milestoneAge}
        milestoneAgeFormatted={milestoneAgeFormatted}
        onNext={() => {
          trackInteractionByType('Next');
          // if (route.params?.quickView) {
          //   navigation.navigate('MilestoneChecklistStack');
          // } else {
          //   navigation.navigate('MilestoneChecklist');
          // }
          if (section === _.last(checklistSections)) {
            setSection(skillTypes[0]);
          } else {
            setSection(checklistSections[checklistSections.indexOf(section) + 1]);
            // navigation.navigate('MilestoneChecklistStack');
          }
        }}
      />
    </View>
  );
};

export default MilestoneChecklistQuickViewScreen;
