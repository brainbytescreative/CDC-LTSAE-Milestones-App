import React, {useEffect, useRef, useState} from 'react';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {FlatList, View} from 'react-native';
import {checklistSections, colors, Section} from '../../resources/constants';
import {Text} from 'react-native-paper';
import QuestionItem from './QuestionItem';
import SectionItem from './SectionItem';
import ActEarlyPage from './ActEarlyPage';
import {
  useGetChecklistQuestions,
  useGetMilestone,
  useGetMilestoneGotStarted,
  useGetSectionsProgress,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useTranslation} from 'react-i18next';
import ButtonWithChevron from '../../components/ButtonWithChevron';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import PurpleArc from '../../components/Svg/PurpleArc';
import ViewPager from '@react-native-community/viewpager';
import withSuspense from '../../components/withSuspense';
import {useQuery} from 'react-query';
import {slowdown} from '../../utils/helpers';

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

  useQuery('MilestoneChecklistScreen', () => slowdown(Promise.resolve(), 0), {staleTime: 0});

  useEffect(() => {
    if (gotStartedStatus === 'success' && !gotStarted) {
      navigation.replace('MilestoneChecklistGetStarted');
    }
  }, [gotStarted, gotStartedStatus, navigation]);

  const flatListRef = useRef<FlatList>(null);
  const viewPagerRef = useRef<ViewPager | null>(null);
  //
  // useEffect(() => {
  //   if (section) {
  //     // flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
  //     // viewPagerRef.current?.setPage(sections.indexOf(section));
  //   }
  // }, [section]);

  const onSectionSet = (val: Section) => {
    setSection(val);
    viewPagerRef.current?.setPageWithoutAnimation(checklistSections.indexOf(val));
    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
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
            <Text style={{textAlign: 'center', marginTop: 38, fontSize: 22, fontFamily: 'Montserrat-Bold'}}>
              {milestoneAgeFormatted}
            </Text>
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
