import React, {useEffect, useMemo, useState} from 'react';
import Layout from '../../components/Layout';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {skillTypes} from '../../resources/constants';
import {Button} from 'react-native-paper';
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

  const onPressNextSection = () => {
    const currentSection = section?.length && sections.indexOf(section);
    if (currentSection !== undefined && currentSection < sections.length - 1) {
      setSection(sections[currentSection + 1]);
    } else {
      setSection(sections[0]);
    }
  };

  return (
    <Layout>
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
          data={questions || []}
          extraData={section}
          renderItem={({item}) => <QuestionItem {...item} childId={childId} />}
          keyExtractor={(item, index) => `${item}-${index}`}
          ListFooterComponent={() => (
            <View style={{alignItems: 'center', marginVertical: 30}}>
              <Button onPress={onPressNextSection} style={{width: 200}} mode={'contained'}>
                Next section
              </Button>
            </View>
          )}
        />
      )}
      {section === 'actEarly' && <ActEarlyPage />}
    </Layout>
  );
};

export default MilestoneChecklistScreen;
