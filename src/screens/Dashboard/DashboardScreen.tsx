import React from 'react';
import {StackNavigationProp, useHeaderHeight} from '@react-navigation/stack';
import {Image, ScrollView, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import {colors} from '../../resources/constants';
import {
  ActEarlySign,
  BabyPlaceholder,
  MilestoneSummarySign,
  NabBarBackground,
  PurpleArc,
  TipsAndActivitiesSign,
} from '../../resources/svg';
import {useTranslation} from 'react-i18next';
import {useSafeArea} from 'react-native-safe-area-context';
import Text from '../../components/Text';
import MonthCarousel, {DataItem} from './MonthCarousel';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {formatDistanceStrict} from 'date-fns';
import {dateFnsLocales} from '../../resources/dateFnsLocales';
import i18next from 'i18next';
import {CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../../components/Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useGetChildAppointments} from '../../hooks/appointmentsHooks';
import {formatDate} from '../../utils/helpers';
import {useGetChecklistQuestions, useGetMilestone} from '../../hooks/checklistHooks';
import MilestoneChecklistWidget from './MilestoneChecklistWidget';
import {useSetOnboarding} from '../../hooks/onboardingHooks';

const DATA: DataItem[] = [
  {
    month: 2,
    progress: 100,
  },
  {
    month: 4,
    progress: 100,
  },
  {
    month: 6,
    progress: 80,
  },
  {
    month: 9,
    progress: 50,
  },
  {
    month: 12,
  },
  {
    month: 18,
  },
  {
    month: 24,
  },
  {
    month: 36,
  },
  {
    month: 48,
  },
  {
    month: 60,
  },
];

interface Props {
  navigation: StackNavigationProp<any>;
}

type DashboardScreenRouteProp = RouteProp<DashboardStackParamList, 'Dashboard'>;
export type DashboardStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const DashboardScreen: React.FC<Props> = () => {
  const headerHeight = useHeaderHeight();
  const {bottom} = useSafeArea();
  const {t} = useTranslation('dashboard');
  const navigation = useNavigation<DashboardStackNavigationProp>();

  const {data: child} = useGetCurrentChild();
  const {data: appointments} = useGetChildAppointments(child?.id);
  const {data: {milestoneAge: childAge} = {}} = useGetMilestone();

  const {refetch} = useGetChecklistQuestions();

  const childAgeText =
    child?.birthday &&
    formatDistanceStrict(child?.birthday, new Date(), {
      locale: dateFnsLocales[i18next.language],
      roundingMethod: 'floor',
    });

  const childName = child?.name;
  const currentAgeIndex = DATA.findIndex((value) => value.month === childAge);
  const [setOnboarding] = useSetOnboarding();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true});
      setOnboarding(true);
    }, [refetch, setOnboarding]),
  );

  return (
    <>
      <ChildSelectorModal />

      <ScrollView style={{backgroundColor: '#fff'}}>
        <View
          style={{
            backgroundColor: colors.iceCold,
            height: headerHeight,
          }}
        />
        <View
          style={{
            top: headerHeight,
            position: 'absolute',
            width: '100%',
          }}>
          <View style={{backgroundColor: colors.iceCold, height: 40}} />
          <NabBarBackground width={'100%'} />
        </View>
        <View>
          <View style={{alignItems: 'center', marginTop: 16, marginBottom: 25}}>
            <View style={styles.image}>
              {child?.photo ? (
                <Image style={{width: '100%', height: '100%', borderRadius: 500}} source={{uri: child?.photo}} />
              ) : (
                <BabyPlaceholder width={'90%'} height={'90%'} />
              )}
            </View>
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.childNameText}>{childName}</Text>
            <Text style={styles.childAgeText}>{t('childAge', {value: childAgeText})}</Text>
          </View>
          <MonthCarousel data={DATA} childAge={childAge || 1} currentAgeIndex={currentAgeIndex} />
          <View style={styles.yellowTipContainer}>
            <Text style={styles.yellowTipText}>{t('yellowTip')}</Text>
          </View>
          <PurpleArc width={'100%'} />
          <View
            style={{
              paddingHorizontal: 32,
              backgroundColor: colors.purple,
            }}>
            <MilestoneChecklistWidget />
            <View
              style={{
                marginVertical: 20,
              }}>
              <Text style={styles.actionItemsTitle}>{t('actionItemsTitle')}</Text>

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={styles.actionItem}>
                  <ActEarlySign />
                  <Text style={styles.actionItemText}>{t('whenToActEarly')}</Text>
                </View>
                <View style={[styles.actionItem, {marginHorizontal: 10}]}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('ChildSummary');
                    }}>
                    <MilestoneSummarySign />
                    <Text style={styles.actionItemText}>{t('milestoneSummary')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionItem}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('TipsAndActivities');
                    }}
                    style={{alignItems: 'center'}}>
                    <TipsAndActivitiesSign />
                    <Text style={styles.actionItemText}>{t('tipsAndActivities')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.appointmentsHeaderContainer]}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                {t('appointments')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddAppointment');
                }}>
                <Text style={{fontSize: 12}}>{t('addApt')}</Text>
              </TouchableOpacity>
            </View>
            {appointments?.map((appt) => (
              <TouchableOpacity
                key={`appointment-${appt.id}`}
                onPress={() => {
                  navigation.navigate('Appointment', {
                    appointmentId: appt.id,
                  });
                }}
                style={[styles.appointmentsContainer, {marginBottom: 20}]}>
                <Text style={{fontSize: 18}}>{appt.apptType}</Text>
                <Text style={{fontSize: 18}}>{formatDate(appt.date, 'datetime')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  appointmentsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  appointmentsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
  },
  actionItem: {
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  actionItemsTitle: {
    fontSize: 22,
    fontFamily: 'montserrat',
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionItemText: {
    fontSize: 15,
    fontFamily: 'montserrat',
    marginTop: 6,
  },

  childNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'montserrat',
  },
  childAgeText: {fontSize: 22, fontFamily: 'Montserrat'},
  yellowTipText: {
    fontSize: 15,
    fontFamily: 'montserrat',
    textAlign: 'center',
  },
  yellowTipContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 50,
    marginHorizontal: 32,
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 30,
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: 190,
    height: 190,
    borderRadius: 190,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },

  container: {
    flex: 1,
    marginTop: 10,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});

export default DashboardScreen;
