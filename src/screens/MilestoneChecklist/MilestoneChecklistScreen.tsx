import React, {useEffect, useRef, useState} from 'react';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {FlatList, View} from 'react-native';
import {checklistSections, colors, skillTypes} from '../../resources/constants';
import {Text} from 'react-native-paper';
import QuestionItem from './QuestionItem';
import SectionItem, {Section} from './SectionItem';
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
import {CompositeNavigationProp} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DashboardDrawerParamsList, MilestoneCheckListParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import PurpleArc from '../../components/Svg/PurpleArc';

const sections = [...skillTypes, 'actEarly'];

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'MilestoneChecklistStack'>,
  StackNavigationProp<MilestoneCheckListParamList, 'MilestoneChecklist'>
>;

const MilestoneChecklistScreen: React.FC<{navigation: NavigationProp}> = ({navigation}) => {
  const [section, setSection] = useState<Section>(checklistSections[0]);
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {data: {questionsGrouped} = {}} = useGetChecklistQuestions();
  const {progress: sectionsProgress} = useGetSectionsProgress(childId);
  const questions = section && questionsGrouped?.get(section);
  const {t} = useTranslation('milestoneChecklist');
  const {data: gotStarted, status: gotStartedStatus} = useGetMilestoneGotStarted({childId, milestoneId: milestoneAge});

  useEffect(() => {
    if (gotStartedStatus === 'success' && !gotStarted) {
      navigation.replace('MilestoneChecklistGetStarted');
    }
  }, [gotStarted, gotStartedStatus, navigation]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (section) {
      flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
    }
  }, [section]);

  const onPressNextSection = () => {
    const currentSection = section?.length && sections.indexOf(section);
    if (currentSection !== undefined && currentSection < sections.length - 1) {
      setSection(sections[currentSection + 1]);
    } else {
      setSection(sections[0]);
    }
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
              setSection={setSection}
              selectedSection={section}
              section={item}
            />
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      </View>
      {section && skillTypes.includes(section) && (
        <FlatList
          ref={flatListRef}
          data={questions || []}
          extraData={section}
          renderItem={({item}) => <QuestionItem {...item} childId={childId} />}
          keyExtractor={(item, index) => `${item}-${index}`}
          ListHeaderComponent={() => (
            <Text style={{textAlign: 'center', marginTop: 38, fontSize: 22, fontFamily: 'Montserrat-Bold'}}>
              {milestoneAgeFormatted}
            </Text>
          )}
          ListFooterComponent={() => (
            <View style={{marginTop: 50}}>
              <PurpleArc width={'100%'} />
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

export default MilestoneChecklistScreen;
