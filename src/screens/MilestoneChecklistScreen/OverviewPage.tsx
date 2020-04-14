import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import Text from '../../components/Text';
import {useTranslation} from 'react-i18next';
import {Button} from 'react-native-paper';
import {useGetChecklistQuestions} from '../../hooks/checklistHooks';

interface Props {
  onNext: () => void;
  milestoneAgeFormatted: string | undefined;
  milestoneAge: number | undefined;
}

const OverviewPage: React.FC<Props> = ({onNext, milestoneAgeFormatted, milestoneAge}) => {
  const {t} = useTranslation('milestones');
  // const questions = (milestoneAge &&
  //   _.chain(
  //     skillTypes.map((section) =>
  //       _.chain(milestoneChecklist).find({id: milestoneAge}).get(`milestones.${section}`).value(),
  //     ),
  //   )
  //     .flatten()
  //     .map((item) => ({...item, value: t(item.value)}))
  //     .value()) as SkillSection[] | undefined;

  const {data, error} = useGetChecklistQuestions();

  const questions = data?.questions || [];

  return (
    <>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <Text style={[styles.header, {marginTop: 20}]}>{milestoneAgeFormatted}</Text>
            <Text style={[styles.header]}>Milestone Quickview</Text>
            <Text style={[styles.text]}>Here a quick look at all of the milestones most children reach</Text>
          </>
        )}
        data={questions}
        keyExtractor={(item) => `overview-${item.id}`}
        renderItem={({item}) => (
          <Text style={[styles.text]}>
            {'•'} {item.value}
          </Text>
        )}
        ListFooterComponent={() => (
          <>
            <View style={{alignItems: 'center', marginTop: 30}}>
              <Button onPress={onNext} mode={'contained'}>
                Next
              </Button>
            </View>
          </>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 5,
  },
  text: {
    paddingHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
  },
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OverviewPage;
