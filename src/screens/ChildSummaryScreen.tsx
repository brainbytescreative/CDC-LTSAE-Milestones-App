import React from 'react';
import {ScrollView, View} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Trans, useTranslation} from 'react-i18next';
import {useGetChecklistQuestions, useGetConcerns, useGetMilestone} from '../hooks/checklistHooks';
import {Text, Title} from 'react-native-paper';
import LanguageSelector from '../components/LanguageSelector';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeArea} from 'react-native-safe-area-context';
import {colors, sharedStyle} from '../resources/constants';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import ChildPhoto from '../components/ChildPhoto';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {PurpleArc} from '../resources/svg';

const ChildSummaryScreen: React.FC<{}> = () => {
  const {t} = useTranslation('childSummary');

  const {data, refetch} = useGetChecklistQuestions();
  const {data: {milestoneAgeFormatted} = {}} = useGetMilestone();
  const {data: concerns} = useGetConcerns();
  const {data: child} = useGetCurrentChild();
  const {bottom} = useSafeArea();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true});
    }, [refetch]),
  );
  const link1 = t('link1');
  const link2 = t('link2');

  return (
    <>
      <View
        style={{
          width: '100%',
          backgroundColor: colors.white,
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottom,
          backgroundColor: colors.white,
        }}>
        <ChildSelectorModal />
        <ChildPhoto photo={child?.photo} />
        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 22,
            textTransform: 'capitalize',
            marginHorizontal: 32,
            fontFamily: 'Montserrat-Bold',
          }}>
          {`${child?.name}${t('childSummary:title')}`}
          {'\n'}
          {milestoneAgeFormatted}
        </Text>
        <View style={{paddingHorizontal: 32}}>
          <Text style={{marginTop: 15, textAlign: 'center', fontSize: 15}}>
            <Trans t={t} i18nKey={'message1'}>
              <Text style={{textDecorationLine: 'underline'}}>{{link1}}</Text>
              <Text style={{textDecorationLine: 'underline'}}>{{link2}}</Text>
            </Trans>
          </Text>
          {/*<Text>Show your doctor or email summary</Text>*/}
        </View>
        <View style={{marginTop: 35}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingTop: 26, paddingBottom: 44}}>
            <AEButtonRounded>{t('emailSummary')}</AEButtonRounded>
            <LanguageSelector style={{marginHorizontal: 32}} />
          </View>
        </View>

        <View style={{marginHorizontal: 32}}>
          <View
            style={[
              {
                backgroundColor: colors.iceCold,
                marginTop: 20,
                padding: 15,
                borderRadius: 10,
              },
              sharedStyle.shadow,
            ]}>
            <Text
              style={{
                fontSize: 18,
                borderRadius: 10,
                fontFamily: 'Montserrat-Bold',
              }}>
              {t('unanswered')}
            </Text>
          </View>
          {data?.groupedByAnswer[`${undefined}`]?.map((item) => (
            <View style={{marginTop: 32}}>
              <Text style={{fontSize: 15}} key={`${item.id}`}>
                {item.value}
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6}}>
                <Text style={{textDecorationLine: 'underline', fontSize: 12}}>Edit answer</Text>
                <Text style={{textDecorationLine: 'underline', fontSize: 12, marginLeft: 15}}>Edit note</Text>
              </View>
            </View>
          ))}
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              textTransform: 'uppercase',
              fontFamily: 'Montserrat-Bold',
            }}>
            Concerns
          </Text>
          {concerns?.concerned?.map((item) => (
            <Text key={`${item.id}`}>{item.value}</Text>
          ))}
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              textTransform: 'uppercase',
              fontFamily: 'Montserrat-Bold',
            }}>
            Yes
          </Text>
          {data?.groupedByAnswer['0']?.map((item) => (
            <Text key={`${item.id}`}>{item.value}</Text>
          ))}
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              textTransform: 'uppercase',
              fontFamily: 'Montserrat-Bold',
            }}>
            Unsure
          </Text>
          {data?.groupedByAnswer['1']?.map((item) => (
            <Text key={`${item.id}`}>{item.value}</Text>
          ))}
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              textTransform: 'uppercase',
              fontFamily: 'Montserrat-Bold',
            }}>
            Not yet
          </Text>
          {data?.groupedByAnswer['2']?.map((item) => (
            <Text key={`${item.id}`}>{item.value}</Text>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default ChildSummaryScreen;
