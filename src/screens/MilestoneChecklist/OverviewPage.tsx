import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {useGetChecklistQuestions} from '../../hooks/checklistHooks';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {PurpleArc} from '../../resources/svg';
import {colors} from '../../resources/constants';
import AEScrollView from '../../components/AEScrollView';
import {useSafeArea} from 'react-native-safe-area-context';

interface Props {
  onNext: () => void;
  milestoneAgeFormatted: string | undefined;
  milestoneAge: number | undefined;
}

const OverviewPage: React.FC<Props> = ({onNext, milestoneAgeFormatted, milestoneAge}) => {
  const {t} = useTranslation('milestoneChecklist');
  const {data, error} = useGetChecklistQuestions();
  const questions = data?.questions || [];
  const {bottom} = useSafeArea();

  return (
    <AEScrollView>
      <View style={{flex: 1}}>
        <View style={{flexGrow: 1}}>
          <Text style={[styles.header, {marginTop: 20}]}>{milestoneAgeFormatted}</Text>
          <Text style={[styles.header]}>{t('milestoneQuickView')}</Text>
          <Text style={[styles.text, {textAlign: 'center', marginHorizontal: 56, marginTop: 15}]}>
            {t('quickViewMessage', {milestone: milestoneAgeFormatted})}
          </Text>

          {questions.map((item, index) => (
            <View
              key={`overview-${index}`}
              style={{
                flexDirection: 'row',
                marginHorizontal: 48,
                marginTop: 15,
              }}>
              <Text style={{fontSize: 15, marginRight: 15, fontFamily: 'Montserrat-Bold'}}>{'+'}</Text>
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
    fontSize: 22,
    textTransform: 'capitalize',
    marginTop: 5,
    marginHorizontal: 48,
    fontFamily: 'Montserrat-Bold',
  },
  text: {
    fontSize: 15,
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
