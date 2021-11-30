import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import _ from 'lodash';
import React, {useMemo} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {queryCache} from 'react-query';

import ChildSelectorModal from '../components/ChildSelectorModal';
import ChecklistMonthCarousel from './MilestoneChecklist/ChecklistMonthCarousel';
import {DashboardStackParamList, DashboardDrawerParamsList} from '../components/Navigator/types';
import withSuspense from '../components/withSuspense';
import {
  useGetChecklistQuestionsArchive,
  useGetConcernsArchive,
  useGetMilestone,
} from '../hooks/checklistHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {Answer} from '../hooks/types';
import {
  colors,
  sharedStyle,
  suspenseEnabled,
} from '../resources/constants';
import {formattedAge, tOpt} from '../utils/helpers';

interface ItemProps {
  value?: string;
}

const Item: React.FC<ItemProps> = ({value}) => {
  return (
    <View style={{marginTop: 35, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}}>{value}</Text>
    </View>
  );
};

export type DataArchiveNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const DataArchiveItems: React.FC = withSuspense(() => {
    const {t} = useTranslation('childSummary');
    const {data} = useGetChecklistQuestionsArchive();
    const {data: concerns} = useGetConcernsArchive();

    const unanswered = data?.groupedByAnswer['undefined'] || [];
    const unsure = data?.groupedByAnswer[Answer.UNSURE] || [];
    const yes = data?.groupedByAnswer[Answer.YES] || [];
    const notYet = data?.groupedByAnswer[Answer.NOT_YET] || [];

    return (
      <View style={{marginHorizontal: 32, marginBottom: 50}}>
        <View style={[styles.blockContainer, {marginBottom: -13, backgroundColor: colors.iceCold}]}>
          <Text style={styles.blockText}>{t('unanswered')}</Text>
        </View>
        {unanswered.map((item) => (
          <Item
            key={`answer-${item.id}`}
            value={item.value}
          />
        ))}
        <View style={[styles.blockContainer, {marginTop: 55, marginBottom: -10, backgroundColor: colors.azalea}]}>
          <Text style={styles.blockText}>{t('concerns')}</Text>
        </View>
        {concerns?.concerned?.map((item) => (
          <Item
            key={`concern-${item.id}`}
            value={item.value}
          />
        ))}
        <View style={[styles.blockContainer, {marginTop: 55, marginBottom: -10, backgroundColor: colors.yellow}]}>
          <Text style={styles.blockText}>{t('notSure')}</Text>
        </View>
        {unsure.map((item) => (
          <Item
            key={`answer-${item.id}`}
            value={item.value}
          />
        ))}
        <View style={[styles.blockContainer, {marginTop: 55, marginBottom: -10, backgroundColor: colors.tanHide}]}>
          <Text style={styles.blockText}>{t('notYet')}</Text>
        </View>
        {notYet.map((item) => (
          <Item
            key={`answer-${item.id}`}
            value={item.value}
          />
        ))}
        <View style={[styles.blockContainer, {marginTop: 55, marginBottom: -10, backgroundColor: colors.lightGreen}]}>
          <Text style={styles.blockText}>{t('yes')}</Text>
        </View>
        {yes.map((item) => (
          <Item
            key={`answer-${item.id}`}
            value={item.value}
          />
        ))}
      </View>
    );
  },
  suspenseEnabled,
  <ActivityIndicator style={{marginTop: 32}} size={'large'} />,
);

const DataArchiveScreen: React.FC = () => {
  const {t, i18n} = useTranslation('dataArchive');
  const navigation = useNavigation<DataArchiveNavigationProp>();

  const {data: child} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {bottom} = useSafeAreaInsets();

  let milestoneAgeForArchive: number | undefined = 0;

  switch (milestoneAge) {
    case 15:
      milestoneAgeForArchive = 12;
      break;
    case 30:
      milestoneAgeForArchive = 24;
      break;
    default:
      milestoneAgeForArchive = milestoneAge;
      break;
  }

  const milestoneAgeFormatted = useMemo(() => {
    return formattedAge(Number(milestoneAgeForArchive), t, i18n.language === 'en').milestoneAgeFormatted;
  }, [i18n.language, milestoneAgeForArchive, t]);

  useFocusEffect(
    React.useCallback(() => {
      queryCache.invalidateQueries((query) => {
        const key = query.queryKey?.[0] as string | undefined;
        return Boolean(key?.startsWith('concerns') || key?.startsWith('questions'));
      });
      queryCache.invalidateQueries('questions');
    }, []),
  );

  const tOptData = tOpt({t, gender: child?.gender});

  return (
    <View style={{backgroundColor: colors.white}}>
      <View style={{marginTop: 1}} >
        <ChecklistMonthCarousel
          isForDataArchiveDesign
        />
      </View>
      <KeyboardAwareScrollView
        enableOnAndroid={Platform.OS === 'android'}
        bounces={false}
        contentContainerStyle={
          {
            paddingBottom: bottom ? bottom + 32 : 72,
          }
        }
        extraHeight={Platform.select({
          ios: 200,
        })}>
        <ChildSelectorModal />
        <Text
          style={[
            {
              textAlign: 'center',
              marginTop: 35,
              marginHorizontal: 32,
            },
            sharedStyle.largeBoldText,
          ]}>
          {`${t('title', {age: milestoneAgeFormatted ?? ''})}`}
        </Text>
        <View style={{paddingHorizontal: 32, marginBottom: 10}}>
          <View style={{marginTop: 15, alignItems: 'flex-start'}}>
            <Text>
              <Trans t={t} i18nKey={'description'} tOptions={{...tOptData}}>
                <Text style={[{fontSize: 15}, sharedStyle.boldText]} />
                <Text style={{fontSize: 15, textAlign: 'center'}} />
                <Text
                  numberOfLines={1}
                  accessibilityRole={'link'}
                  onPress={() => {
                    navigation.goBack();
                  }}
                  style={{fontSize: 15, textDecorationLine: 'underline', textAlign: 'left'}}
                />
              </Trans>
            </Text>
          </View>
        </View>
        <DataArchiveItems />
      </KeyboardAwareScrollView>
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
  },
});

export default DataArchiveScreen;