import React, {useEffect} from 'react';
import FrontPage from './FrontPage';
import {
  useGetMilestone,
  useGetMilestoneGotStarted,
  useGetSectionsProgress,
  useSetMilestoneGotStarted,
} from '../../hooks/checklistHooks';
import {FlatList, View} from 'react-native';
import {checklistSections, colors} from '../../resources/constants';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import SectionItem from './SectionItem';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardStackParamList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import {useGetCurrentChild} from '../../hooks/childrenHooks';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklistGetStarted'>,
  StackNavigationProp<DashboardStackParamList>
>;

const MilestoneChecklistGetStartedScreen: React.FC<{}> = () => {
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {progress: sectionsProgress} = useGetSectionsProgress();
  const navigation = useNavigation<NavigationProp>();
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: gotStarted, status: gotStartedStatus} = useGetMilestoneGotStarted({childId, milestoneId: milestoneAge});

  const [setGetStarted] = useSetMilestoneGotStarted();

  useEffect(() => {
    if (gotStartedStatus === 'success' && gotStarted) {
      navigation.replace('MilestoneChecklist');
    }
  }, [gotStarted, gotStartedStatus, navigation]);

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
      <FrontPage
        milestoneAgeFormatted={milestoneAgeFormatted}
        onGetStarted={() => {
          setGetStarted({milestoneId: milestoneAge, childId}).then(() =>
            navigation.navigate('MilestoneChecklistQuickView'),
          );
        }}
      />
    </View>
  );
};

export default MilestoneChecklistGetStartedScreen;