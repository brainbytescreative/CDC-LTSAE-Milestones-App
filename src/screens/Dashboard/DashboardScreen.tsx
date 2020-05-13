import React from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {childAges, colors, sharedStyle} from '../../resources/constants';
import {ActEarlySign, MilestoneSummarySign, PurpleArc, TipsAndActivitiesSign} from '../../resources/svg';
import {useTranslation} from 'react-i18next';
import MonthCarousel from './MonthCarousel';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../../components/Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useGetChildAppointments} from '../../hooks/appointmentsHooks';
import {formatAge, formatDate} from '../../utils/helpers';
import {useGetChecklistQuestions, useGetMilestone, useGetMilestoneGotStarted} from '../../hooks/checklistHooks';
import MilestoneChecklistWidget from './MilestoneChecklistWidget';
import {useSetOnboarding} from '../../hooks/onboardingHooks';
import {Text} from 'react-native-paper';
import NavBarBackground from '../../resources/svg/NavBarBackground';
import ChildPhoto from '../../components/ChildPhoto';

interface Props {
  navigation: StackNavigationProp<any>;
}

type DashboardScreenRouteProp = RouteProp<DashboardStackParamList, 'Dashboard'>;
export type DashboardStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const DashboardScreen: React.FC<Props> = () => {
  const {t} = useTranslation('dashboard');
  const navigation = useNavigation<DashboardStackNavigationProp>();

  const {data: child} = useGetCurrentChild();
  const {data: appointments} = useGetChildAppointments(child?.id);
  const {data: {milestoneAge: childAge, milestoneAgeFormatted} = {}} = useGetMilestone();
  useGetMilestoneGotStarted({childId: child?.id, milestoneId: childAge});
  const {refetch} = useGetChecklistQuestions();

  const childAgeText = formatAge(child?.birthday);

  const childName = child?.name;
  const currentAgeIndex = childAges.findIndex((value) => value === childAge);
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

      <ScrollView bounces={false} style={{backgroundColor: '#fff'}}>
        <View
          style={{
            position: 'absolute',
            width: '100%',
          }}>
          <View style={{backgroundColor: colors.iceCold, height: 40}} />
          <NavBarBackground width={'100%'} />
        </View>
        <View>
          <ChildPhoto photo={child?.photo} />
          <View style={{alignItems: 'center'}}>
            <Text style={styles.childNameText}>{childName}</Text>
            <Text style={styles.childAgeText}>{t('childAge', {value: childAgeText})}</Text>
          </View>
          <MonthCarousel childAge={childAge || 1} currentAgeIndex={currentAgeIndex} />
          <View style={styles.yellowTipContainer}>
            <Text style={styles.yellowTipText}>{t('yellowTip')}</Text>
          </View>
          <PurpleArc width={'100%'} />
          <View
            style={{
              paddingTop: 26,
              paddingHorizontal: 32,
              backgroundColor: colors.purple,
            }}>
            <MilestoneChecklistWidget />
            <View
              style={{
                marginVertical: 20,
              }}>
              <Text style={styles.actionItemsTitle}>
                {t('actionItemsTitle', {
                  age: `${milestoneAgeFormatted}`,
                })}
              </Text>

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={styles.actionItem}>
                  <ActEarlySign />
                  <Text numberOfLines={2} adjustsFontSizeToFit style={styles.actionItemText}>
                    {t('whenToActEarly')}
                  </Text>
                </View>
                <View style={[styles.actionItem, {marginHorizontal: 10}]}>
                  <TouchableOpacity
                    style={[{alignItems: 'center'}]}
                    onPress={() => {
                      navigation.navigate('ChildSummaryStack');
                    }}>
                    <MilestoneSummarySign />
                    <Text numberOfLines={2} adjustsFontSizeToFit style={styles.actionItemText}>
                      {t('milestoneSummary')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionItem}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('TipsAndActivities');
                    }}
                    style={{alignItems: 'center'}}>
                    <TipsAndActivitiesSign />
                    <Text numberOfLines={2} adjustsFontSizeToFit style={styles.actionItemText}>
                      {t('tipsAndActivities')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.appointmentsHeaderContainer]}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'Montserrat-Bold',
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
                style={[styles.appointmentsContainer, {marginBottom: 20}, sharedStyle.shadow]}>
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
    ...sharedStyle.shadow,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  actionItemsTitle: {
    fontSize: 22,
    marginHorizontal: 20,
    marginBottom: 20,
    textTransform: 'capitalize',
    fontFamily: 'Montserrat-Bold',
  },
  actionItemText: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },

  childNameText: {
    fontSize: 22,
    textAlign: 'center',
    marginHorizontal: 32,
    fontFamily: 'Montserrat-Bold',
  },
  childAgeText: {fontSize: 22},
  yellowTipText: {
    fontSize: 15,
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
    ...sharedStyle.shadow,
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
