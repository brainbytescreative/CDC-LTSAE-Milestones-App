/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useState} from 'react';
import {ProgressBar} from 'react-native-paper';
import {StackNavigationProp, useHeaderHeight} from '@react-navigation/stack';
import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {ScrollView} from 'react-native-gesture-handler';
import {colors} from '../../resources/constants';
import {
  ActEarlySign,
  MilestoneSummarySign,
  NabBarBackground,
  PurpleArc,
  TipsAndActivitiesSign,
} from '../../resources/svg';
import {useTranslation} from 'react-i18next';
import {useSafeArea} from 'react-native-safe-area-context';
import Text from '../../components/Text';
import MonthCarousel, {DataItem} from './MonthCarousel';
import ChildSelectorModal from './ChildSelectorModal';

const DATA: DataItem[] = [
  {
    month: 1,
    progress: 100,
  },
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
];

interface Props {
  navigation: StackNavigationProp<any>;
}

const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const headerHeight = useHeaderHeight();
  const {bottom} = useSafeArea();
  const {t} = useTranslation('dashboard');

  const childAge = 9;
  const childName = 'Mina Jaquelina';
  const currentAgeIndex = DATA.findIndex((value) => value.month === childAge);

  return (
    <>
      <ChildSelectorModal />
      <ScrollView style={{paddingTop: headerHeight, backgroundColor: '#fff'}}>
        <View
          style={{
            backgroundColor: colors.iceCold,
            height: headerHeight,
            marginTop: -headerHeight,
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: '100%',
          }}>
          <View style={{backgroundColor: '#94F5EB', height: 40}} />
          <NabBarBackground width={'100%'} />
        </View>
        <View>
          <View style={{alignItems: 'center', marginTop: 16, marginBottom: 25}}>
            <View style={styles.image} />
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.childNameText}>{childName}</Text>
            <Text style={styles.childAgeText}>
              {t('childAge', {unit: 'month', value: childAge})}
            </Text>
          </View>
          <MonthCarousel
            data={DATA}
            childAge={childAge}
            currentAgeIndex={currentAgeIndex}
          />
          <View style={styles.yellowTipContainer}>
            <Text style={styles.yellowTipText}>{t('yellowTip')}</Text>
          </View>
          <PurpleArc width={'100%'} />
          <View
            style={{
              paddingHorizontal: 32,
              backgroundColor: colors.purple,
              marginTop: -1,
            }}>
            <View
              style={{backgroundColor: 'white', padding: 20, borderRadius: 15}}>
              <View style={styles.milestoneCheckListContainer}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: 'montserrat',
                  }}>
                  {t('milestoneCheckList')}
                </Text>
                <EvilIcons name={'chevron-right'} size={30} />
              </View>
              <ProgressBar
                style={{
                  height: 10,
                  borderRadius: 5,
                  marginVertical: 10,
                }}
                progress={0.5}
                color={colors.lightGreen}
              />
              <Text> {t('milestonesAnswered', {progress: '10/20'})}</Text>
            </View>
            <View
              style={{
                marginVertical: 20,
              }}>
              <Text style={styles.actionItemsTitle}>
                {t('actionItemsTitle')}
              </Text>

              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={styles.actionItem}>
                  <ActEarlySign />
                  <Text style={styles.actionItemText}>
                    {t('whenToActEarly')}
                  </Text>
                </View>
                <View style={[styles.actionItem, {marginHorizontal: 10}]}>
                  <MilestoneSummarySign />
                  <Text style={styles.actionItemText}>
                    {t('milestoneSummary')}
                  </Text>
                </View>
                <View style={styles.actionItem}>
                  <TipsAndActivitiesSign />
                  <Text style={styles.actionItemText}>
                    {t('tipsAndActivities')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.appointmentsHeaderContainer}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                }}>
                {t('appointments')}
              </Text>
              <Text style={{fontSize: 12}}>{t('addApt')}</Text>
            </View>
            <View
              style={[
                styles.appointmentsContainer,
                {marginBottom: 40 + bottom},
              ]}>
              <Text style={{fontSize: 18}}>{t('checkUp')}</Text>
              <Text style={{fontSize: 18}}>1/2/20 3:30pm</Text>
            </View>
          </View>
        </View>
        <View style={{height: headerHeight}} />
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
  milestoneCheckListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: 'yellow',
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
