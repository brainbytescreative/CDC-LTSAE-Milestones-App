import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Trans, useTranslation} from 'react-i18next';
import {useGetChecklistQuestions, useGetConcerns, useGetMilestone} from '../hooks/checklistHooks';
import {Text} from 'react-native-paper';
import LanguageSelector from '../components/LanguageSelector';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeArea} from 'react-native-safe-area-context';
import {colors, sharedStyle} from '../resources/constants';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import ChildPhoto from '../components/ChildPhoto';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {PurpleArc} from '../resources/svg';
import * as MailComposer from 'expo-mail-composer';
import emailSummaryContent from '../resources/EmailChildSummary';
import nunjucks from 'nunjucks';
import {formatDate, tOpt} from '../utils/helpers';

interface ItemProps {
  value?: string;
  id?: string | number;
  note?: string | null;
}

const Item: React.FC<ItemProps> = ({value, id, note}) => {
  const {t} = useTranslation('childSummary');
  return (
    <View style={{marginTop: 32, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}} key={`${id}`}>
        {value}
      </Text>
      {note && (
        <Text style={{fontSize: 15}} key={`${id}`}>
          <Text style={{fontFamily: 'Montserrat-Bold'}}>
            {t('note')}
            {': '}
          </Text>{' '}
          {note}
        </Text>
      )}
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6}}>
        <Text style={{textDecorationLine: 'underline', fontSize: 12}}>{t('editAnswer')}</Text>
        <Text style={{textDecorationLine: 'underline', fontSize: 12, marginLeft: 15}}>{t('editNote')}</Text>
      </View>
    </View>
  );
};

const ChildSummaryScreen: React.FC<{}> = () => {
  const {t} = useTranslation('childSummary');

  const {data, refetch} = useGetChecklistQuestions();
  const {data: {milestoneAgeFormatted} = {}} = useGetMilestone();
  const {data: concerns, refetch: refetchConcerns} = useGetConcerns();
  const {data: child} = useGetCurrentChild();
  const {bottom} = useSafeArea();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true}).then();
      refetchConcerns({force: true}).then();
    }, [refetch, refetchConcerns]),
  );
  const link1 = t('link1Text');
  const link2 = t('link2Text');

  return (
    <View style={{backgroundColor: colors.white}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottom + 32,
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
            <AEButtonRounded
              onPress={() => {
                MailComposer.composeAsync({
                  isHtml: true,
                  body: nunjucks.renderString(emailSummaryContent.en, {
                    childName: child?.name,
                    concerns: concerns?.concerned,
                    skippedItems: data?.groupedByAnswer[`${undefined}`],
                    yesItems: data?.groupedByAnswer['0'],
                    notSureItems: data?.groupedByAnswer['1'],
                    notYetItems: data?.groupedByAnswer['2'],
                    formattedAge: milestoneAgeFormatted,
                    currentDayText: formatDate(new Date(), 'date'),
                    ...tOpt({t, gender: child?.gender}),
                  }),
                });
              }}
              style={{marginBottom: 0}}>
              {t('emailSummary')}
            </AEButtonRounded>
            <AEButtonRounded style={{marginTop: 10, marginBottom: 30}}>{t('showDoctor')}</AEButtonRounded>
            <LanguageSelector onLanguageChange={() => refetch({force: true})} style={{marginHorizontal: 32}} />
          </View>
        </View>

        <View style={{marginHorizontal: 32}}>
          <View style={[styles.blockContainer, {backgroundColor: colors.iceCold}]}>
            <Text style={styles.blockText}>{t('unanswered')}</Text>
          </View>
          {data?.groupedByAnswer['undefined']?.map((item) => (
            <Item value={item.value} id={item.id} note={item.note} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.yellow}]}>
            <Text style={styles.blockText}>{t('concerns')}</Text>
          </View>
          {concerns?.concerned?.map((item) => (
            <Item value={item.value} note={item.note} id={item.id} />
          ))}

          <View style={[styles.blockContainer, {backgroundColor: colors.tanHide}]}>
            <Text style={styles.blockText}>{t('notSure')}</Text>
          </View>
          {data?.groupedByAnswer['1']?.map((item) => (
            <Item value={item.value} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.apricot}]}>
            <Text style={styles.blockText}>{t('notYet')}</Text>
          </View>
          {data?.groupedByAnswer['2']?.map((item) => (
            <Item value={item.value} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.lightGreen}]}>
            <Text style={styles.blockText}>{t('yes')}</Text>
          </View>
          {data?.groupedByAnswer['0']?.map((item) => (
            <Item value={item.value} note={item.note} id={item.id} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    ...sharedStyle.shadow,
  },
  blockText: {
    fontSize: 18,
    borderRadius: 10,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'capitalize',
  },
});

export default ChildSummaryScreen;
