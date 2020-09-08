import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {differenceInDays, differenceInWeeks, format} from 'date-fns';
import React, {RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {queryCache} from 'react-query';

import AEYellowBox from '../../components/AEYellowBox';
import ChildPhoto from '../../components/ChildPhoto';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../../components/Navigator/types';
import ActEarlySign from '../../components/Svg/ActEarlySign';
import MilestoneSummarySign from '../../components/Svg/MilestoneSummarySign';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import PurpleArc from '../../components/Svg/PurpleArc';
import TipsAndActivitiesSign from '../../components/Svg/TipsAndActivitiesSign';
import withSuspense from '../../components/withSuspense';
import {useGetChildAppointments} from '../../hooks/appointmentsHooks';
import {useGetMilestone, useGetMilestoneGotStarted} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useSetOnboarding} from '../../hooks/onboardingHooks';
import {Appointment} from '../../hooks/types';
import {colors, sharedStyle, suspenseEnabled} from '../../resources/constants';
import {dateFnsLocales} from '../../resources/dateFnsLocales';
import i18next from '../../resources/l18n';
import {trackSelectByType} from '../../utils/analytics';
import {formatAge, formatDate} from '../../utils/helpers';
import MilestoneChecklistWidget from './MilestoneChecklistWidget';
import MonthCarousel from './MonthCarousel';

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
  // ageLessTwoMonth: boolean;
  scrollViewRef?: RefObject<ScrollView>;
}

const styles = StyleSheet.create({
  spinnerContainer: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  appointmentsHeaderContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 0,
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
    padding: 7,
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

const AppointmentsList: React.FC = withSuspense(
  () => {
    const navigation = useNavigation<DashboardStackNavigationProp>();
    const {data: child} = useGetCurrentChild();
    const {data: appointments = []} = useGetChildAppointments(child?.id);
    const {t} = useTranslation('dashboard');

    return (
      <>
        {appointments.map((appt) => {
          return (
            <TouchableOpacity
              accessibilityRole={'button'}
              accessibilityLabel={t('accessibility:appointmentCaption', {
                caption: appt.apptType,
                time: format(appt.date, 'PPPpp', {
                  locale: dateFnsLocales[i18next.language],
                }),
              })}
              key={`appointment-${appt.id}`}
              onPress={() => {
                trackSelectByType('Add Appointment');
                navigation.navigate('Appointment', {
                  appointmentId: appt.id,
                });
              }}
              style={[styles.appointmentsContainer, {marginBottom: 20}, sharedStyle.shadow]}>
              <Text style={{fontSize: 18}}>{appt.apptType}</Text>
              {/*<Text style={{fontSize: 18}}>{formatDate(appt.date, 'datetime')}</Text>*/}
              <Text style={{fontSize: 18}}>{formatDate(appt.date, 'datetime')}</Text>
            </TouchableOpacity>
          );
        })}
      </>
    );
  },
  {shared: {suspense: true}},
  <View />,
);

const YellowBoxSuspended: React.FC = withSuspense(
  () => {
    const {t} = useTranslation('dashboard');
    const {data: child} = useGetCurrentChild();
    const ageInWeeks = child?.birthday && differenceInWeeks(new Date(), child?.birthday);
    const ageInDays = child?.birthday && differenceInDays(new Date(), child?.birthday);
    const ageLessTwoMonth = Number(ageInWeeks) < 6;
    const {data: {betweenCheckList = false} = {}} = useGetMilestone();
    let showtip = betweenCheckList || ageLessTwoMonth;
    showtip = Number(ageInDays) >= 41 && Number(ageInDays) <= 56 ? false : showtip;
    return showtip ? (
      <AEYellowBox containerStyle={styles.yellowTipContainer}>
        {ageLessTwoMonth ? t('yellowTipLessTwoMonth') : t('yellowTip')}
      </AEYellowBox>
    ) : null;
  },
  suspenseEnabled,
  <View />,
);

const Buttons = () => {
  const {t} = useTranslation('dashboard');
  const navigation = useNavigation<Props['navigation']>();
  const fontSize = Math.ceil((Dimensions.get('screen').width * 11) / 320);

  return (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <TouchableOpacity
        onPress={() => {
          trackSelectByType('When to Act Early');
          navigation.navigate('WhenActEarly');
        }}
        style={styles.actionItem}>
        <ActEarlySign />
        <Text numberOfLines={3} style={[styles.actionItemText, {fontSize}]}>
          {t('whenToActEarly')}
        </Text>
      </TouchableOpacity>
      <View style={[styles.actionItem, {marginHorizontal: 10}]}>
        <TouchableOpacity
          style={[{alignItems: 'center'}]}
          onPress={() => {
            trackSelectByType('My Child Summary');
            navigation.navigate('ChildSummary');
          }}>
          <MilestoneSummarySign />
          <Text numberOfLines={3} style={[styles.actionItemText, {fontSize}]}>
            {t('milestoneSummary')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionItem}>
        <TouchableOpacity
          onPress={() => {
            trackSelectByType('Tips');
            navigation.navigate('TipsAndActivities');
          }}
          style={{alignItems: 'center'}}>
          <TipsAndActivitiesSign />
          <Text numberOfLines={3} style={[styles.actionItemText, {fontSize}]}>
            {t('tipsAndActivities')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DashboardSkeleton: React.FC<SkeletonProps> = ({childPhotoComponent, scrollViewRef}) => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const appointmentsParam = route.params?.appointments;
  const [appointmentsPosition, setAppointmentsPosition] = useState(0);

  useLayoutEffect(() => {
    if (appointmentsParam && appointmentsPosition) {
      navigation.setParams({appointments: undefined});
      scrollViewRef?.current?.scrollTo({y: Number(appointmentsPosition) + 100});
    }
  }, [appointmentsParam, appointmentsPosition, navigation, scrollViewRef]);

  const {t} = useTranslation('dashboard');
  return (
    <View>
      {childPhotoComponent}
      <ChildName />
      <MonthCarousel />
      <YellowBoxSuspended />
      {/*<AEYellowBox containerStyle={styles.yellowTipContainer}>*/}
      {/*  {ageLessTwoMonth ? t('yellowTipLessTwoMonth') : t('yellowTip')}*/}
      {/*</AEYellowBox>*/}
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
          {/*<Text style={styles.actionItemsTitle}>*/}
          {/*  {t('actionItemsTitle', {*/}
          {/*    age: `${milestoneAgeFormatted || '  '}`,*/}
          {/*  })}*/}
          {/*</Text>*/}
          <Buttons />
        </View>
        <View
          onLayout={(event) => {
            setAppointmentsPosition(event.nativeEvent.layout.y);
          }}
          style={[styles.appointmentsHeaderContainer]}>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Montserrat-Bold',
            }}>
            {t('appointments')}
          </Text>
          <TouchableOpacity
            style={{paddingTop: 12}}
            accessibilityRole={'button'}
            accessibilityLabel={t('addAppointment:title')}
            onPress={() => {
              navigation.navigate('AddAppointment');
            }}>
            <Text style={{fontSize: 14}}>{t('addApt')}</Text>
          </TouchableOpacity>
        </View>
        <AppointmentsList />
      </View>
    </View>
  );
};

const ChildName: React.FC = withSuspense(
  () => {
    const {t} = useTranslation('dashboard');
    // const currentDay = new Date().getDay();
    const {data: {name: childName, birthday} = {}} = useGetCurrentChild();
    const childAgeText = useMemo(() => formatAge(birthday), [birthday]);

    return (
      <View style={{alignItems: 'center'}}>
        <Text style={styles.childNameText}>{childName}</Text>
        <Text style={styles.childAgeText}>{t('childAge', {value: childAgeText})}</Text>
      </View>
    );
  },
  {shared: {suspense: true}},
  <View style={[{height: 54}, styles.spinnerContainer]}>
    <ActivityIndicator size={'small'} />
  </View>,
);

const DashboardContainer: React.FC<{scrollViewRef?: RefObject<ScrollView>}> = withSuspense(
  ({scrollViewRef}) => {
    const {data: child} = useGetCurrentChild();
    const {data: {milestoneAge} = {}} = useGetMilestone();
    useGetMilestoneGotStarted({childId: child?.id, milestoneId: milestoneAge});
    const [setOnboarding] = useSetOnboarding();
    // const ageInWeeks = child?.birthday && differenceInWeeks(new Date(), child?.birthday);
    // const ageLessTwoMonth = Number(ageInWeeks) < 6;

    // useEffect(() => {
    //   child && setMilestoneNotifications({child});
    // }, [child, setMilestoneNotifications]);
    // useEffect(() => {
    //   sheduleNotifications();
    // }, [sheduleNotifications]);

    useFocusEffect(
      React.useCallback(() => {
        setTimeout(() => {
          setOnboarding({finished: true});
        }, 3000);
        // refetch();
        queryCache.invalidateQueries('questions', {refetchInactive: true});
      }, [setOnboarding]),
    );

    // useQuery(['timeout', {childId: child?.id, milestoneId: milestoneAge}], () => {
    //   return slowdown(Promise.resolve(), 200);
    // });

    return (
      <DashboardSkeleton
        scrollViewRef={scrollViewRef}
        // ageLessTwoMonth={ageLessTwoMonth}
        // childNameComponent={
        //   <View style={{alignItems: 'center'}}>
        //     <Text style={styles.childNameText}>{childName}</Text>
        //     <Text style={styles.childAgeText}>{t('childAge', {value: childAgeText})}</Text>
        //   </View>
        // }
        // appointments={appointments}
        // milestoneAgeFormatted={milestoneAgeFormatted}
        // milestoneChecklistWidgetComponent={<MilestoneChecklistWidget />}
        // monthSelectorComponent={<MonthCarousel />}
        childPhotoComponent={<ChildPhoto photo={child?.photo} />}
      />
    );
  },
  {shared: {suspense: false}},
  <DashboardSkeleton
    // ageLessTwoMonth={false}
    childPhotoComponent={<ChildPhoto />}
  />,
);

const DashboardScreen: React.FC<Props> = ({navigation, route}) => {
  // useGetMilestoneGotStarted({childId: child?.id, year: childAge});
  // const {refetch} = useGetChecklistQuestions();

  const addChildParam = route.params?.addChild;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (addChildParam) {
      navigation.setParams({addChild: undefined});
    }
  }, [addChildParam, navigation]);

  return (
    <>
      <ChildSelectorModal visible={addChildParam} />
      <ScrollView
        ref={scrollViewRef}
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
        <DashboardContainer scrollViewRef={scrollViewRef} />
      </ScrollView>
    </>
  );
};

export default DashboardScreen;
