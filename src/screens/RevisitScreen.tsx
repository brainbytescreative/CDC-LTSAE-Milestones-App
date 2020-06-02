import React from 'react';
import {Image, Linking, StyleSheet, View} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {colors, sharedStyle} from '../resources/constants';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import LanguageSelector from '../components/LanguageSelector';
import {useGetChecklistQuestions, useGetConcerns, useGetMilestone} from '../hooks/checklistHooks';
import {Text} from 'react-native-paper';
import {Trans, useTranslation} from 'react-i18next';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import AEScrollView from '../components/AEScrollView';
import {tOpt} from '../utils/helpers';
import {useFocusEffect} from '@react-navigation/native';
import CDCLogo from '../components/Svg/CDCLogo';

interface ItemProps {
  value?: string;
  id?: string | number;
  index: string | number;
  note?: string | null;
}

const Item: React.FC<ItemProps> = ({value, id, note, index}) => {
  const {t} = useTranslation('childSummary');
  return (
    <View style={{marginTop: 32, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}} key={`${id}`}>
        <Text style={[sharedStyle.boldText]}>{`${index}. `}</Text>
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
    </View>
  );
};

const RevisitScreen: React.FC = () => {
  const {data, refetch} = useGetChecklistQuestions();
  const {data: child} = useGetCurrentChild();
  const {t} = useTranslation('revisit');
  const {data: concerns, refetch: refetchConcerns} = useGetConcerns();
  const {data: {milestoneAgeFormattedDashes} = {}} = useGetMilestone();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true}).then();
      refetchConcerns({force: true}).then();
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
            refetch({force: true});
            refetchConcerns({force: true}).then();
          }}
          style={{marginHorizontal: 32, marginTop: 16}}
        />
        <Text
          style={[
            sharedStyle.screenTitle,
            {
              textTransform: 'none',
            },
          ]}>
          {t('thankYouText', {childName: child?.name})}
        </Text>
        <View style={styles.logosRow}>
          <CDCLogo />
          <Image style={{marginLeft: 24}} source={require('../resources/images/LTSAE_Logo.png')} />
        </View>
        <Text style={{fontSize: 15, marginHorizontal: 32, marginTop: 30, lineHeight: 18, textAlign: 'center'}}>
          <Trans t={t} i18nKey={'description'}>
            <Text style={[sharedStyle.boldText, {textAlign: 'center'}]} />
          </Trans>
        </Text>
        <View style={{marginHorizontal: 32}}>
          <View style={[styles.blockContainer, {backgroundColor: colors.apricot}]}>
            <Text style={styles.blockText}>{t('concerns')}</Text>
          </View>
          {concerns?.concerned?.map((item, index) => (
            <Item value={item.value} index={index + 1} note={item.note} id={item.id} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.tanHide}]}>
            <Text style={styles.blockText}>
              {t('notYet', {
                milestoneAge: milestoneAgeFormattedDashes,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['2']?.map((item, index) => (
            <Item index={index + 1} value={item.value} note={item.note} id={item.id} />
          ))}
          <Text style={{fontSize: 15, lineHeight: 18, marginTop: 20, marginHorizontal: 16}}>
            <Trans t={t} i18nKey={'notYetText'}>
              <Text onPress={() => Linking.openURL(t('concernedLink'))} style={{textDecorationLine: 'underline'}} />
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
            {t('timeToCelebrate')}
          </Text>
          <View style={[styles.blockContainer, {backgroundColor: colors.iceCold}]}>
            <Text style={styles.blockText}>
              {t('unanswered', {
                milestoneAge: milestoneAgeFormattedDashes,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['undefined']?.map((item, index) => (
            <Item index={index + 1} value={item.value} id={item.id} note={item.note} />
          ))}
          <View style={[styles.blockContainer, {backgroundColor: colors.yellow}]}>
            <Text style={styles.blockText}>
              {t('notSure', {
                milestoneAge: milestoneAgeFormattedDashes,
              })}
            </Text>
          </View>
          {data?.groupedByAnswer['1']?.map((item, index) => (
            <Item index={index + 1} value={item.value} note={item.note} id={item.id} />
          ))}
          <View style={[styles.yellowTipContainer, {marginTop: 40}]}>
            <Text style={styles.yellowTipText}>
              {t('yellowTip', {
                childName: child?.name,
                ...tOpt({t, gender: child?.gender}),
              })}
            </Text>
          </View>
          <Text
            style={{
              marginBottom: 50,
              marginHorizontal: 16,
              textAlign: 'center',
              lineHeight: 18,
              fontSize: 15,
            }}>
            <Trans t={t} i18nKey={'thankYouText2'}>
              <Text onPress={() => Linking.openURL(t('actEarlyLink'))} style={{textDecorationLine: 'underline'}} />
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
    marginBottom: 50,
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    ...sharedStyle.shadow,
  },
});

export default RevisitScreen;
