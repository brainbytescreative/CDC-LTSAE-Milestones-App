import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {FlatList, View} from 'react-native';

import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DashboardStackParamList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {
  useGetMilestone,
  useGetMilestoneGotStarted,
  useGetSectionsProgress,
  useSetMilestoneGotStarted,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {checklistSections, colors} from '../../resources/constants';
import {trackInteractionByType} from '../../utils/analytics';
import FrontPage from './FrontPage';
import SectionItem from './SectionItem';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklistGetStarted'>,
  StackNavigationProp<DashboardStackParamList>
>;

const MilestoneChecklistGetStartedScreen: React.FC = () => {
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {progress: sectionsProgress} = useGetSectionsProgress(childId);
  const navigation = useNavigation<NavigationProp>();
  const {data: gotStarted, status: gotStartedStatus} = useGetMilestoneGotStarted({childId, milestoneId: milestoneAge});

  const [setGetStarted] = useSetMilestoneGotStarted();

  // useEffect(() => {
  //   if (gotStartedStatus === 'success' && gotStarted) {
  //     navigation.replace('MilestoneChecklist');
  //   }
  // }, [gotStarted, gotStartedStatus, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      if (gotStartedStatus === 'success' && gotStarted) {
        navigation.replace('MilestoneChecklist');
      }
    }, [gotStarted, gotStartedStatus, navigation]),
  );

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0}}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={checklistSections}
          horizontal={true}
          renderItem={({item}) => <SectionItem progress={sectionsProgress?.get(item)} section={item} />}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      <FrontPage
        milestoneAgeFormatted={milestoneAgeFormatted}
        onGetStarted={() => {
          setGetStarted({milestoneId: milestoneAge, childId}).then(() => {
            navigation.navigate('MilestoneChecklist');
            trackInteractionByType('Get Started');
          });
        }}
      />
    </View>
  );
};

export default MilestoneChecklistGetStartedScreen;
