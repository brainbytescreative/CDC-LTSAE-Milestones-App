import React, {useMemo, useState} from 'react';
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
import {useGetChecklistQuestions, useGetMilestone, useGetSectionsProgress} from '../../hooks/checklistHooks';

const MilestoneChecklistScreen: React.FC<{}> = () => {
  const [section, setSection] = useState<Section | undefined>();
  const [gotStarted, setGotStarted] = useState(false);
  const {milestoneAgeFormatted, milestoneAge, child} = useGetMilestone();
  const {data} = useGetChecklistQuestions();

  const sections = useMemo<Section[]>(() => {
    return [...skillTypes, 'actEarly'];
  }, []);

  const sectionsProgress = useGetSectionsProgress();

  const questions = section && data?.questionsGrouped.get(section);

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
          data={questions}
          extraData={section}
          renderItem={({item}) => <QuestionItem {...item} childId={child?.id} />}
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
