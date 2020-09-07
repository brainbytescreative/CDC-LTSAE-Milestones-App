import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Linking, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

import AEScrollView from '../components/AEScrollView';
import ChildSelectorModal from '../components/ChildSelectorModal';
import LanguageSelector from '../components/LanguageSelector';
import LTSAELogo from '../components/LTSAELogo';
import CDCLogo from '../components/Svg/CDCLogo';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import withSuspense from '../components/withSuspense';
import {useGetChecklistQuestions, useGetConcerns, useGetMilestone} from '../hooks/checklistHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {colors, sharedStyle, suspenseEnabled} from '../resources/constants';
import {tOpt} from '../utils/helpers';

interface ItemProps {
  value?: string;
  id?: string | number;
  index: string | number;
  note?: string | null;
}

const Item: React.FC<ItemProps> = ({value, note, index}) => {
  const {t} = useTranslation('childSummary');
  return (
    <View style={{marginTop: 32, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}}>
        <Text style={[sharedStyle.boldText]}>{`${index}. `}</Text>
        {value}
      </Text>
      {!!note && (
        <Text style={{fontSize: 15}}>
          <Text>
            {t('note')}
            {': '}
          </Text>
          {note}
        </Text>
      )}
    </View>
  );
};

const RevisitScreen: React.FC = () => {
  const {data, refetch} = useGetChecklistQuestions();
  const {data: child} = useGetCurrentChild();
  const {t} = useTranslation('revisit');
  const {data: concerns, refetch: refetchConcerns} = useGetConcerns();
  const {data: {milestoneAgeFormatted} = {}} = useGetMilestone();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      refetchConcerns();
    }, [refetch, refetchConcerns]),
  );

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <AEScrollView>
        <ChildSelectorModal />
        <LanguageSelector
          onLanguageChange={() => {
            refetch();
            refetchConcerns();
          }}
          style={{marginHorizontal: 32, marginTop: 16}}
        />
        <Text style={[sharedStyle.screenTitle]}>{t('thankYouText', {childName: child?.name})}</Text>
        <View style={styles.logosRow}>
          <CDCLogo />
          <LTSAELogo />
        </View>
        <Text style={{fontSize: 15, marginHorizontal: 32, marginTop: 30, lineHeight: 18, textAlign: 'center'}}>
          {t('description')}
        </Text>
        <View style={[styles.yellowTipContainer, {marginTop: 30, marginHorizontal: 32}]}>
          <Text style={styles.yellowTipText}>
            {t('yellowTip', {
              childName: child?.name,
              ...tOpt({t, gender: child?.gender}),
            })}
          </Text>
        </View>
        <Text
          style={[
            {fontSize: 15, marginHorizontal: 32, marginTop: 30, lineHeight: 18, textAlign: 'center'},
            sharedStyle.boldText,
          ]}>
          {t('actearly', {name: child?.name})}
        </Text>

        <View style={{marginHorizontal: 32}}>
          <View style={[styles.blockContainer, {backgroundColor: colors.azalea}]}>
            <Text style={styles.blockText}>{t('concerns')}</Text>
          </View>
          {concerns?.concerned?.map((item, index) => (
            <Item key={`concern-${item.id}`} value={item.value} index={index + 1} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.tanHide}]}>
            <Text style={styles.blockText}>
              {t('notYet', {
                milestoneAge: milestoneAgeFormatted,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['2']?.map((item, index) => (
            <Item key={`answer-${item.id}`} index={index + 1} value={item.value} note={item.note} id={item.id} />
          ))}
          <Text style={{fontSize: 15, lineHeight: 18, marginTop: 20, marginHorizontal: 16}}>
            <Trans t={t} i18nKey={'notYetText'} tOptions={{name: child?.name}}>
              <Text
                accessibilityRole={'link'}
                onPress={() => Linking.openURL(t('concernedLink'))}
                style={{textDecorationLine: 'underline'}}
              />
            </Trans>
          </Text>
          <Text
            style={[
              {
                fontSize: 15,
                lineHeight: 18,
                marginTop: 40,
                marginHorizontal: 16,
              },
              sharedStyle.boldText,
            ]}>
            {t('timeToCelebrate', {name: child?.name})}
          </Text>
          <View style={[styles.blockContainer, {backgroundColor: colors.yellow}]}>
            <Text style={styles.blockText}>
              {t('notSure', {
                milestoneAge: milestoneAgeFormatted,
              })}
            </Text>
          </View>
          <Text style={[sharedStyle.regularText, sharedStyle.boldText, {marginTop: 32}]}>{t('unsureTip')}</Text>
          {data?.groupedByAnswer['1']?.map((item, index) => (
            <Item key={`answer-${item.id}`} index={index + 1} value={item.value} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.lightGreen}]}>
            <Text style={styles.blockText}>
              {t('yes', {
                milestoneAge: milestoneAgeFormatted,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['0']?.map((item, index) => (
            <Item key={`answer-${item.id}`} index={index + 1} value={item.value} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.iceCold}]}>
            <Text style={styles.blockText}>
              {t('unanswered', {
                milestoneAge: milestoneAgeFormatted,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['undefined']?.map((item, index) => (
            <Item key={`answer-${item.id}`} index={index + 1} value={item.value} id={item.id} note={item.note} />
          ))}

          <Text
            style={{
              marginTop: 40,
              marginBottom: 50,
              marginHorizontal: 16,
              textAlign: 'center',
              lineHeight: 18,
              fontSize: 15,
            }}>
            <Trans t={t} i18nKey={'thankYouText2'}>
              <Text
                accessibilityRole={'link'}
                onPress={() => Linking.openURL(t('actEarlyLink'))}
                style={{textDecorationLine: 'underline'}}
              />
            </Trans>
          </Text>
        </View>
      </AEScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  logosRow: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockContainer: {
    marginTop: 40,
    padding: 15,
    borderRadius: 10,
    ...sharedStyle.shadow,
  },
  blockText: {
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 10,
    fontFamily: 'Montserrat-Bold',
  },
  yellowTipText: {
    fontSize: 15,
    textAlign: 'center',
  },
  yellowTipContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    // marginBottom: 50,
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    ...sharedStyle.shadow,
  },
});

export default withSuspense(RevisitScreen, suspenseEnabled);
