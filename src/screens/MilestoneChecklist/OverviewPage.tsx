import React, {useEffect, useRef} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {useGetChecklistQuestions, useGetConcerns} from '../../hooks/checklistHooks';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {colors, Section, sharedStyle, skillTypes} from '../../resources/constants';
import AEScrollView from '../../components/AEScrollView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import PurpleArc from '../../components/Svg/PurpleArc';
import withSuspense from '../../components/withSuspense';

interface Props {
  onNext: () => void;
  milestoneAgeFormatted: string | undefined;
  milestoneAge: number | undefined;
  section?: Section;
}

type OverviewItems = {value: string | undefined}[];
type OverviewMap = Map<string, OverviewItems>;

const OverviewPage: React.FC<Props> = ({onNext, milestoneAgeFormatted, section = skillTypes[0], milestoneAge}) => {
  const {t} = useTranslation('milestoneChecklist');
  const questionsGrouped = useGetChecklistQuestions().data!.questionsGrouped! as OverviewMap;
  const {bottom} = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const concerns = useGetConcerns().data!.concerns! as OverviewItems;

  useEffect(() => {
    questionsGrouped.set('actEarly', concerns);
  }, [concerns, questionsGrouped]);

  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
    }, []),
  );

  const isBirthday: boolean = Number(milestoneAge) % 12 === 0;

  return (
    <AEScrollView innerRef={scrollViewRef}>
      <View style={{flex: 1}}>
        <View style={{flexGrow: 1}}>
          <Text style={[styles.header, {marginTop: 20}]}>{milestoneAgeFormatted}</Text>
          <Text style={[styles.header]}>{t('milestoneQuickView')}</Text>
          <Text style={[styles.text, {textAlign: 'center', marginHorizontal: 56, marginTop: 15}]}>
            {isBirthday
              ? t('quickViewMessageBirthDay', {milestone: milestoneAgeFormatted})
              : t('quickViewMessage', {milestone: milestoneAgeFormatted})}
          </Text>

          {questionsGrouped?.get(section)?.map((item, index) => (
            <View
              key={`overview-${index}`}
              style={{
                flexDirection: 'row',
                marginHorizontal: 48,
                marginTop: 15,
              }}>
              <Text style={{fontSize: 15, marginRight: 15}}>{'+'}</Text>
              <View
                style={{
                  flexGrow: 1,
                  flex: 1,
                  width: 0,
                }}>
                <Text style={{fontSize: 15}}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{marginTop: 30}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingBottom: bottom ? bottom : 32, paddingTop: 16}}>
            <AEButtonRounded onPress={onNext}>{t('common:next')}</AEButtonRounded>
          </View>
        </View>
      </View>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    textTransform: 'capitalize',
    marginTop: 5,
    marginHorizontal: 48,
    ...sharedStyle.largeBoldText,
  },
  text: {
    fontSize: 15,
  },
});

export default withSuspense(
  OverviewPage,
  {
    shared: {suspense: true},
  },
  <View />,
);
