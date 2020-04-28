import React, {useEffect, useRef, useState} from 'react';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {FlatList, TouchableWithoutFeedback, View} from 'react-native';
import {colors, sharedStyle, skillTypes} from '../../resources/constants';
import {Text, Title} from 'react-native-paper';
import QuestionItem from './QuestionItem';
import SectionItem, {Section} from './SectionItem';
import FrontPage from './FrontPage';
import ActEarlyPage from './ActEarlyPage';
import OverviewPage from './OverviewPage';
import {
  useGetChecklistQuestions,
  useGetConcerns,
  useGetMilestone,
  useGetSectionsProgress,
  useSetConcern,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useHeaderHeight} from '@react-navigation/stack';
import ChevronRightBig from '../../resources/svg/ChevronRightBig';
import {PurpleArc} from '../../resources/svg';
import {useTranslation} from 'react-i18next';

const sections = [...skillTypes, 'actEarly'];

const MilestoneChecklistScreen: React.FC<{}> = () => {
  const [section, setSection] = useState<Section | undefined>();
  const [gotStarted, setGotStarted] = useState(false);
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAgeFormatted, milestoneAge} = {}} = useGetMilestone();
  const {data: {answeredQuestionsCount, questionsGrouped} = {}} = useGetChecklistQuestions();
  const {data: {missingId} = {}} = useGetConcerns();
  const {progress: sectionsProgress, complete} = useGetSectionsProgress();
  const [setConcern] = useSetConcern();
  const questions = section && questionsGrouped?.get(section);
  const headerHeight = useHeaderHeight();
  const {t} = useTranslation('milestoneChecklist');

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setGotStarted(false);
  }, [childId]);

  useEffect(() => {
    if (complete !== undefined && childId && missingId) {
      setConcern({answer: !complete, childId, concernId: missingId});
    }
  }, [childId, setConcern, complete, missingId]);

  useEffect(() => {
    if (answeredQuestionsCount === 0 && !gotStarted) {
      setSection(undefined);
      setGotStarted(false);
    }
    if (answeredQuestionsCount && answeredQuestionsCount > 0 && section === undefined) {
      setSection(sections[0]);
    }
  }, [gotStarted, section, answeredQuestionsCount, childId]);

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
      <View style={{flex: 0}}>
        <FlatList
          extraData={sectionsProgress}
          data={sections}
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
      {!section && !gotStarted && (
        <FrontPage
          milestoneAgeFormatted={milestoneAgeFormatted}
          onGetStarted={() => {
            setGotStarted(true);
          }}
        />
      )}
      {!section && gotStarted && (
        <OverviewPage
          milestoneAge={milestoneAge}
          milestoneAgeFormatted={milestoneAgeFormatted}
          onNext={() => {
            setSection(sections[0]);
          }}
        />
      )}
      {section && skillTypes.includes(section) && (
        <FlatList
          ref={flatListRef}
          data={questions || []}
          extraData={section}
          renderItem={({item}) => <QuestionItem {...item} childId={childId} />}
          keyExtractor={(item, index) => `${item}-${index}`}
          ListHeaderComponent={() => (
            <Text style={{textAlign: 'center', marginTop: 38, fontFamily: 'Montserrat-Bold'}}>
              {milestoneAgeFormatted}
            </Text>
          )}
          ListFooterComponent={() => (
            <View style={{marginTop: 50}}>
              <PurpleArc width={'100%'} />
              <View style={{backgroundColor: colors.purple}}>
                <TouchableWithoutFeedback onPress={onPressNextSection}>
                  <View
                    style={[
                      {
                        backgroundColor: colors.white,
                        margin: 32,
                        borderRadius: 10,
                        flexDirection: 'row',
                        paddingRight: 16,
                        height: 60,
                        alignItems: 'center',
                      },
                      sharedStyle.shadow,
                    ]}>
                    <Text style={{flexGrow: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold'}}>
                      {t('nextSection')}
                    </Text>
                    <ChevronRightBig width={10} height={20} />
                  </View>
                </TouchableWithoutFeedback>
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
