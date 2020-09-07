import ViewPager from '@react-native-community/viewpager';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import _ from 'lodash';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, Platform, View} from 'react-native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {Text} from 'react-native-paper';
import {useQuery} from 'react-query';

import ButtonWithChevron from '../../components/ButtonWithChevron';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import PurpleArc from '../../components/Svg/PurpleArc';
import withSuspense from '../../components/withSuspense';
import {
  useGetCheckListAnswers,
  useGetChecklistQuestions,
  useGetMilestone,
  useGetMilestoneGotStarted,
  useGetSectionsProgress,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {Section, checklistSections, colors, sharedStyle} from '../../resources/constants';
import {trackChecklistUnanswered, trackInteractionByType} from '../../utils/analytics';
import {formattedAgeSingular, slowdown} from '../../utils/helpers';
import ActEarlyPage from './ActEarlyPage';
import QuestionItem from './QuestionItem';
import SectionItem from './SectionItem';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneChecklistStack'>,
  StackNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklist'>
>;

const QuestionsList: React.FC<{
  flatListRef: RefObject<KeyboardAwareFlatList>;
  section: Section;
  onPressNextSection: () => void;
}> = withSuspense(
  ({flatListRef, section, onPressNextSection}) => {
    const {t} = useTranslation('milestoneChecklist');
    const questionsGrouped = useGetChecklistQuestions().data!.questionsGrouped ?? new Map();
    const milestoneAge = useGetMilestone().data?.milestoneAge;
    const milestoneAgeFormatted = formattedAgeSingular(t, milestoneAge);
    const childId = useGetCurrentChild().data?.id;

    return (
      <KeyboardAwareFlatList
        // enableOnAndroid={Platform.OS === 'android'}
        extraHeight={Platform.select({
          ios: 200,
        })}
        ref={flatListRef}
        bounces={false}
        initialNumToRender={1}
        scrollIndicatorInsets={{right: 0.1}}
        data={questionsGrouped?.get(section) || []}
        renderItem={({item}) => <QuestionItem {...item} childId={childId} />}
        keyExtractor={(item, index) => `question-item-${item.id}-${index}`}
        ListHeaderComponent={() => (
          <Text style={[{textAlign: 'center', marginTop: 38}, sharedStyle.largeBoldText]}>{milestoneAgeFormatted}</Text>
        )}
        ListFooterComponent={() => (
          <View style={{marginTop: 50}}>
            <PurpleArc />
            <View style={{backgroundColor: colors.purple}}>
              <ButtonWithChevron onPress={onPressNextSection}>{t('nextSection')}</ButtonWithChevron>
            </View>
          </View>
        )}
      />
    );
  },
  {shared: {suspense: true}, queries: {staleTime: Infinity}},
);

const Tabs: React.FC<{onSectionSet: (section: Section) => void; section: Section}> = ({onSectionSet, section}) => {
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {progress: sectionsProgress} = useGetSectionsProgress(childId);
  return (
    <FlatList
      extraData={sectionsProgress}
      showsHorizontalScrollIndicator={false}
      data={checklistSections}
      horizontal={true}
      renderItem={({item}) => (
        <SectionItem
          progress={sectionsProgress?.get(item)}
          // setSection={setSection}
          onSectionSet={onSectionSet}
          selectedSection={section}
          section={item}
        />
      )}
      keyExtractor={(item, index) => `${item}-${index}`}
    />
  );
};

const MilestoneChecklistScreen: React.FC<{
  navigation: NavigationProp;
  route: RouteProp<MilestoneCheckListParamList, 'MilestoneChecklist'>;
}> = ({navigation}) => {
  const [section, setSection] = useState<Section>(checklistSections[0]);
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {data: gotStarted, status: gotStartedStatus} = useGetMilestoneGotStarted({childId, milestoneId: milestoneAge});
  const {data: {unansweredData} = {}} = useGetCheckListAnswers(milestoneAge, childId);
  const prevSection = useRef<{name: Section}>({name: 'social'}).current;

  useQuery('MilestoneChecklistScreen', () => slowdown(Promise.resolve(), 0), {staleTime: 0});

  useEffect(() => {
    if (gotStartedStatus === 'success' && !gotStarted) {
      navigation.replace('MilestoneChecklistGetStarted');
    }
  }, [gotStarted, gotStartedStatus, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      gotStarted && trackInteractionByType('Started Social Milestones');
      return () => {
        if (unansweredData && !_.isEmpty(unansweredData)) {
          trackChecklistUnanswered();
          // const unanswered = unansweredData.map((data) => t(`milestones:${data.value}`, {lng: 'en'})).join(',');
          // ACPCore.trackAction(`Unanswered questions: ${unanswered}`, {'gov.cdc.appname': 'CDC Health IQ'});
        }
      };
    }, [unansweredData, gotStarted]),
  );

  const flatListRef = useRef<KeyboardAwareFlatList>(null);
  const viewPagerRef = useRef<ViewPager | null>(null);

  useEffect(() => {
    if (section !== prevSection.name) {
      switch (prevSection.name) {
        case 'social':
          trackInteractionByType('Completed Social Milestones');
          break;
        case 'language':
          trackInteractionByType('Completed Language Milestones');
          break;
        case 'cognitive':
          trackInteractionByType('Completed Cognitive Milestones');
          break;
        case 'movement':
          trackInteractionByType('Completed Movement Milestones');
          break;
        case 'actEarly':
          break;
      }
    }
  }, [section, prevSection.name]);

  const onSectionSet = (val: Section) => {
    prevSection.name = section;
    setSection(val);
    viewPagerRef.current?.setPageWithoutAnimation(checklistSections.indexOf(val));

    // if (Platform.OS === 'android') {
    //   flatListRef.current?.scrollForExtraHeightOnAndroid(-300);
    // } else {
    setTimeout(() => {
      flatListRef.current?.scrollToPosition(0, 0, false);
    }, 100);
    // }

    switch (val) {
      case 'social':
        trackInteractionByType('Started Social Milestones');
        break;
      case 'language':
        trackInteractionByType('Started Language Milestones');
        break;
      case 'cognitive':
        trackInteractionByType('Started Cognitive Milestones');
        break;
      case 'movement':
        trackInteractionByType('Started Movement Milestones');
        break;
      case 'actEarly':
        trackInteractionByType('Started When to Act Early');
        break;
    }
  };

  const onPressNextSection = () => {
    const currentSection = section?.length && checklistSections.indexOf(section);
    let nextSection: Section;
    if (currentSection !== undefined && currentSection < checklistSections.length - 1) {
      // setSection(sections[currentSection + 1]);
      nextSection = checklistSections[currentSection + 1];
    } else {
      // setSection(sections[0]);
      nextSection = checklistSections[0];
    }
    onSectionSet(nextSection);
    trackInteractionByType('Next Section');
  };

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <ChildSelectorModal />
      <View style={{flex: 0, overflow: 'visible'}}>
        <Tabs section={section} onSectionSet={onSectionSet} />
      </View>
      {section && section !== 'actEarly' && (
        <QuestionsList flatListRef={flatListRef} onPressNextSection={onPressNextSection} section={section} />
      )}
      {section === 'actEarly' && <ActEarlyPage />}
    </View>
  );
};

export default withSuspense(MilestoneChecklistScreen, {
  shared: {
    suspense: true,
  },
  queries: {
    staleTime: Infinity,
  },
});
