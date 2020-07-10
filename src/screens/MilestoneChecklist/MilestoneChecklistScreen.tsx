import React, {useEffect, useRef, useState} from 'react';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {FlatList, View} from 'react-native';
import {checklistSections, colors, Section, sharedStyle} from '../../resources/constants';
import {Text} from 'react-native-paper';
import QuestionItem from './QuestionItem';
import SectionItem from './SectionItem';
import ActEarlyPage from './ActEarlyPage';
import {
  useGetCheckListAnswers,
  useGetChecklistQuestions,
  useGetMilestone,
  useGetMilestoneGotStarted,
  useGetSectionsProgress,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useTranslation} from 'react-i18next';
import ButtonWithChevron from '../../components/ButtonWithChevron';
import {CompositeNavigationProp, RouteProp, useFocusEffect} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import PurpleArc from '../../components/Svg/PurpleArc';
import ViewPager from '@react-native-community/viewpager';
import withSuspense from '../../components/withSuspense';
import {useQuery} from 'react-query';
import {slowdown} from '../../utils/helpers';
import {ACPCore} from '@adobe/react-native-acpcore';
import _ from 'lodash';
import {trackInteractionByType} from '../../utils/analytics';

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneChecklistStack'>,
  StackNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklist'>
>;

const MilestoneChecklistScreen: React.FC<{
  navigation: NavigationProp;
  route: RouteProp<MilestoneCheckListParamList, 'MilestoneChecklist'>;
}> = ({navigation}) => {
  const [section, setSection] = useState<Section>(checklistSections[0]);
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {data: {questionsGrouped} = {}} = useGetChecklistQuestions();
  const {progress: sectionsProgress} = useGetSectionsProgress(childId);
  const {t} = useTranslation('milestoneChecklist');
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
      return () => {
        if (unansweredData && !_.isEmpty(unansweredData)) {
          const unanswered = unansweredData.map((data) => t(`milestones:${data.value}`, {lng: 'en'})).join(',');
          ACPCore.trackState(`Unanswered questions: ${unanswered}`, {'gov.cdc.appname': 'CDC Health IQ'});
        }
        gotStarted && trackInteractionByType('Started Social Milestones');
      };
    }, [unansweredData, t, gotStarted]),
  );

  const flatListRef = useRef<FlatList>(null);
  const viewPagerRef = useRef<ViewPager | null>(null);
  //
  // useEffect(() => {
  //   if (section) {
  //     // flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
  //     // viewPagerRef.current?.setPage(sections.indexOf(section));
  //   }
  // }, [section]);

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
    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
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
      </View>
      {/*<ViewPager*/}
      {/*  key={`${childId}`}*/}
      {/*  ref={viewPagerRef}*/}
      {/*  scrollEnabled={false}*/}
      {/*  // onPageSelected={(event) => {*/}
      {/*  //   // setPosition(event.nativeEvent.position);*/}
      {/*  //   // setSection(sections[event.nativeEvent.position]);*/}
      {/*  //   // onSectionSet(sections[event.nativeEvent.position]);*/}
      {/*  //   InteractionManager.runAfterInteractions(() => {*/}
      {/*  //     setSection(sections[event.nativeEvent.position]);*/}
      {/*  //   });*/}
      {/*  // }}*/}
      {/*  style={{flex: 1}}*/}
      {/*  initialPage={0}>*/}
      {/*  {*/}
      {/*    sections.map((val) =>*/}
      {/*      val !== 'actEarly' ? (*/}
      {/*        <FlatList*/}
      {/*          // ref={flatListRef}*/}
      {/*          initialNumToRender={2}*/}
      {/*          key={val}*/}
      {/*          data={questionsGrouped?.get(val) || []}*/}
      {/*          renderItem={({item}) => <QuestionItem {...item} childId={childId} />}*/}
      {/*          keyExtractor={(item, index) => `${item.id}-${index}`}*/}
      {/*          ListHeaderComponent={() => (*/}
      {/*            <Text style={[{textAlign: 'center', marginTop: 38}, sharedStyle.largeBoldText]}>*/}
      {/*              {milestoneAgeFormatted}*/}
      {/*            </Text>*/}
      {/*          )}*/}
      {/*          ListFooterComponent={() => (*/}
      {/*            <View style={{marginTop: 50}}>*/}
      {/*              <PurpleArc width={'100%'} />*/}
      {/*              <View style={{backgroundColor: colors.purple}}>*/}
      {/*                <ButtonWithChevron onPress={onPressNextSection}>{t('nextSection')}</ButtonWithChevron>*/}
      {/*              </View>*/}
      {/*            </View>*/}
      {/*          )}*/}
      {/*        />*/}
      {/*      ) : (*/}
      {/*        <ActEarlyPage key={val} />*/}
      {/*      ),*/}
      {/*    ) as any*/}
      {/*  }*/}
      {/*</ViewPager>*/}
      {section && section !== 'actEarly' && (
        <FlatList
          ref={flatListRef}
          bounces={false}
          initialNumToRender={2}
          scrollIndicatorInsets={{right: 0.1}}
          data={questionsGrouped?.get(section) || []}
          renderItem={({item}) => <QuestionItem {...item} childId={childId} />}
          keyExtractor={(item, index) => `question-item-${item.id}-${index}`}
          ListHeaderComponent={() => (
            <Text style={[{textAlign: 'center', marginTop: 38}, sharedStyle.boldText]}>{milestoneAgeFormatted}</Text>
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
      )}
      {section === 'actEarly' && <ActEarlyPage />}
    </View>
  );
};

export default withSuspense(MilestoneChecklistScreen, {
  suspense: true,
  staleTime: Infinity,
});
