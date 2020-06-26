import React, {Suspense, useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors, sharedStyle} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import MonthCarousel from './MonthCarousel';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../../components/Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {Appointment, useGetChildAppointments} from '../../hooks/appointmentsHooks';
import {formatAge, formatDate} from '../../utils/helpers';
import {useGetChecklistQuestions, useGetMilestone, useGetMilestoneGotStarted} from '../../hooks/checklistHooks';
import MilestoneChecklistWidget from './MilestoneChecklistWidget';
import {useSetOnboarding} from '../../hooks/onboardingHooks';
import {Text} from 'react-native-paper';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import ChildPhoto from '../../components/ChildPhoto';
import {ReactQueryConfigProvider} from 'react-query';
import AEYellowBox from '../../components/AEYellowBox';
import ActEarlySign from '../../components/Svg/ActEarlySign';
import MilestoneSummarySign from '../../components/Svg/MilestoneSummarySign';
import TipsAndActivitiesSign from '../../components/Svg/TipsAndActivitiesSign';
import PurpleArc from '../../components/Svg/PurpleArc';
import {differenceInWeeks} from 'date-fns';

interface Props {
  navigation: StackNavigationProp<any>;
  route: RouteProp<DashboardStackParamList, 'Dashboard'>;
}

export type DashboardStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

interface SkeletonProps {
  childPhotoComponent?: any;
  childNameComponent?: any;
  monthSelectorComponent?: any;
  milestoneChecklistWidgetComponent?: any;
  milestoneAgeFormatted?: string;
  appointments?: Appointment[];
  ageLessTwoMonth: boolean;
}

const DashboardSkeleton: React.FC<SkeletonProps> = ({
  childPhotoComponent,
  childNameComponent,
  monthSelectorComponent,
  milestoneChecklistWidgetComponent,
  appointments = [],
  ageLessTwoMonth,
}) => {
  const navigation = useNavigation<DashboardStackNavigationProp>();
  const {t} = useTranslation('dashboard');
  return (
    <View>
      {childPhotoComponent}
      {childNameComponent}
      {monthSelectorComponent}
      <AEYellowBox containerStyle={styles.yellowTipContainer}>
        {ageLessTwoMonth ? t('yellowTipLessTwoMonth') : t('yellowTip')}
      </AEYellowBox>
      <PurpleArc width={'100%'} />
      <View
        style={{
          paddingTop: 26,
          paddingHorizontal: 32,
          backgroundColor: colors.purple,
        }}>
        {milestoneChecklistWidgetComponent}
        <View
          style={{
            marginVertical: 20,
          }}>
          {/*<Text style={styles.actionItemsTitle}>*/}
          {/*  {t('actionItemsTitle', {*/}
          {/*    age: `${milestoneAgeFormatted || '  '}`,*/}
          {/*  })}*/}
          {/*</Text>*/}

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('WhenActEarly');
              }}
              style={styles.actionItem}>
              <ActEarlySign />
              <Text numberOfLines={2} adjustsFontSizeToFit style={styles.actionItemText}>
                {t('whenToActEarly')}
              </Text>
            </TouchableOpacity>
            <View style={[styles.actionItem, {marginHorizontal: 10}]}>
              <TouchableOpacity
                style={[{alignItems: 'center'}]}
                onPress={() => {
                  navigation.navigate('ChildSummary');
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
  );
};

const DashboardContainer: React.FC = () => {
  const {data: child} = useGetCurrentChild();
  const {data: appointments} = useGetChildAppointments(child?.id);
  const {data: {milestoneAge, milestoneAgeFormatted} = {}} = useGetMilestone();
  useGetMilestoneGotStarted({childId: child?.id, milestoneId: milestoneAge});
  const {refetch} = useGetChecklistQuestions();
  const {t} = useTranslation('dashboard');
  const childAgeText = formatAge(child?.birthday);
  // const [setMilestoneNotifications] = useSetMilestoneNotifications();
  // const [sheduleNotifications] = useScheduleNotifications();
  const childName = child?.name;
  const [setOnboarding] = useSetOnboarding();
  // const navigation = useNavigation();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ageInWeeks = differenceInWeeks(new Date(), child!.birthday);
  const ageLessTwoMonth = ageInWeeks < 6;

  // useEffect(() => {
  //   child && setMilestoneNotifications({child});
  // }, [child, setMilestoneNotifications]);
  // useEffect(() => {
  //   sheduleNotifications();
  // }, [sheduleNotifications]);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        setOnboarding(true);
        refetch({force: true});
      }, 3000);
    }, [setOnboarding, refetch]),
  );

  // useQuery(['timeout', {childId: child?.id, milestoneId: milestoneAge}], () => {
  //   return slowdown(Promise.resolve(), 200);
  // });

  return (
    <DashboardSkeleton
      ageLessTwoMonth={ageLessTwoMonth}
      childNameComponent={
        <View style={{alignItems: 'center'}}>
          <Text style={styles.childNameText}>{childName}</Text>
          <Text style={styles.childAgeText}>{t('childAge', {value: childAgeText})}</Text>
        </View>
      }
      appointments={appointments}
      milestoneAgeFormatted={milestoneAgeFormatted}
      milestoneChecklistWidgetComponent={<MilestoneChecklistWidget />}
      monthSelectorComponent={<MonthCarousel />}
      childPhotoComponent={<ChildPhoto photo={child?.photo} />}
    />
  );
};

const DashboardScreen: React.FC<Props> = ({navigation, route}) => {
  // useGetMilestoneGotStarted({childId: child?.id, year: childAge});
  // const {refetch} = useGetChecklistQuestions();

  const addChildParam = route.params?.addChild;
  useEffect(() => {
    if (addChildParam) {
      navigation.setParams({addChild: false});
    }
  }, [addChildParam, navigation]);

  return (
    <>
      <ReactQueryConfigProvider
        config={{
          suspense: true,
        }}>
        <ChildSelectorModal visible={addChildParam} />

        <ScrollView
          scrollIndicatorInsets={{right: 0.1}}
          bounces={false}
          style={{backgroundColor: '#fff'}}
          contentContainerStyle={{flexGrow: 1}}>
          <View
            style={{
              position: 'absolute',
              width: '100%',
            }}>
            <View style={{backgroundColor: colors.iceCold, height: 40}} />
            <NavBarBackground width={'100%'} />
          </View>
          <Suspense
            fallback={
              <DashboardSkeleton
                ageLessTwoMonth={false}
                childNameComponent={
                  <View style={[{height: 54}, styles.spinnerContainer]}>
                    <ActivityIndicator size={'small'} />
                  </View>
                }
                milestoneChecklistWidgetComponent={
                  <View style={[{height: 114}, styles.spinnerContainer]}>
                    <ActivityIndicator size={'large'} />
                  </View>
                }
                monthSelectorComponent={
                  <View style={[{height: 172}, styles.spinnerContainer]}>
                    <ActivityIndicator size={'large'} />
                  </View>
                }
                childPhotoComponent={<ChildPhoto />}
              />
            }>
            <DashboardContainer />
          </Suspense>
        </ScrollView>
      </ReactQueryConfigProvider>
    </>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    alignContent: 'center',
    justifyContent: 'center',
  },
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
  yellowTipContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 50,
    marginTop: 0,
    marginHorizontal: 32,
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default DashboardScreen;
