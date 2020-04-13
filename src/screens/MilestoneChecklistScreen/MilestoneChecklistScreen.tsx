import React, {useMemo, useState} from 'react';
import Text from '../../components/Text';
import Layout from '../../components/Layout';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {StyleSheet, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {skillTypes} from '../../resources/constants';
import {Button} from 'react-native-paper';
import _ from 'lodash';
import milestoneChecklist, {SkillSection} from '../../resources/milestoneChecklist';
import QuestionItem from './QuestionItem';
import SectionItem, {Section} from './SectionItem';
import FrontPage from './FrontPage';
import ActEarlyPage from './ActEarlyPage';
import OverviewPage from './OverviewPage';
import {useGetMilestone} from '../../hooks/childrenHooks';

const MilestoneChecklistScreen: React.FC<{}> = () => {
  const [section, setSection] = useState<Section | undefined>();
  const [gotStarted, setGotStarted] = useState(false);
  const {milestoneAgeFormatted, milestoneAge} = useGetMilestone();

  const sections = useMemo<Section[]>(() => {
    return [...skillTypes, 'actEarly'];
  }, []);

  const questions = useMemo<SkillSection[] | undefined>(() => {
    return milestoneAge && _.chain(milestoneChecklist).find({id: milestoneAge}).get(`milestones.${section}`).value();
  }, [section, milestoneAge]);

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
          data={sections}
          horizontal={true}
          renderItem={({item}) => <SectionItem setSection={setSection} selectedSection={section} section={item} />}
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
          renderItem={({item}) => <QuestionItem {...item} />}
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
