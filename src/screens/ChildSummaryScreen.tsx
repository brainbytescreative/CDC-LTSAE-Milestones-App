import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {useTranslation} from 'react-i18next';
import {useGetChecklistQuestions, useGetConcerns} from '../hooks/checklistHooks';
import {Button, Title} from 'react-native-paper';
import LanguageSelector from '../components/LanguageSelector';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeArea} from 'react-native-safe-area-context';

const ChildSummaryScreen: React.FC<{}> = () => {
  const {t} = useTranslation('childSummary');

  const {data, refetch} = useGetChecklistQuestions();
  const {milestoneAgeFormatted, concerns} = useGetConcerns();
  const {bottom} = useSafeArea();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true});
    }, [refetch]),
  );

  return (
    <ScrollView contentContainerStyle={{paddingBottom: bottom}}>
      <ChildSelectorModal />
      <Title style={{textAlign: 'center', marginTop: 20, fontSize: 20, textTransform: 'uppercase'}}>
        {t('childSummary:title')}
        {' - '}
        {milestoneAgeFormatted}
      </Title>
      <View style={{paddingHorizontal: 32}}>
        <Text style={{marginTop: 10}}>Below are the responses you enterd for child</Text>
        <Text>Show your doctor or email summary</Text>
      </View>
      <View style={{alignItems: 'center', marginTop: 20}}>
        <Button mode={'outlined'}>Email summary</Button>
      </View>

      <LanguageSelector />
      <View style={{marginHorizontal: 32}}>
        <Title
          style={{
            marginTop: 20,
            fontSize: 18,
            textTransform: 'uppercase',
          }}>
          Unanswered
        </Title>
        {data?.groupedByAnswer[`${undefined}`]?.map((item) => (
          <Text key={`${item.id}`}>{item.value}</Text>
        ))}
        <Title
          style={{
            marginTop: 20,
            fontSize: 18,
            textTransform: 'uppercase',
          }}>
          Concerns
        </Title>
        {concerns?.concerned?.map((item) => (
          <Text key={`${item.id}`}>{item.value}</Text>
        ))}
        <Title
          style={{
            marginTop: 20,
            fontSize: 18,
            textTransform: 'uppercase',
          }}>
          Yes
        </Title>
        {data?.groupedByAnswer['0']?.map((item) => (
          <Text key={`${item.id}`}>{item.value}</Text>
        ))}
        <Title
          style={{
            marginTop: 20,
            fontSize: 18,
            textTransform: 'uppercase',
          }}>
          Unsure
        </Title>
        {data?.groupedByAnswer['1']?.map((item) => (
          <Text key={`${item.id}`}>{item.value}</Text>
        ))}
        <Title
          style={{
            marginTop: 20,
            fontSize: 18,
            textTransform: 'uppercase',
          }}>
          Not yet
        </Title>
        {data?.groupedByAnswer['2']?.map((item) => (
          <Text key={`${item.id}`}>{item.value}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default ChildSummaryScreen;
