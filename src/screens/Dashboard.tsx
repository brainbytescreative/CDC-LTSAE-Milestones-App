/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {Colors, ProgressBar} from 'react-native-paper';
import {useHeaderHeight} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {colors} from '../resources/constants';
import {
  ActEarlySign,
  ChevronLeft,
  ChevronRight,
  MilestoneSummarySign,
  NabBarBackground,
  PurpleArc,
  TipsAndActivitiesSign,
} from '../resources/svg';
import {useTranslation} from 'react-i18next';
import content from '*.svg';
import {useSafeArea} from 'react-native-safe-area-context';
import Text from '../components/Text';

interface DataItem {
  month: number;
  progress?: number;
  current?: boolean;
}

const DATA: DataItem[] = [
  {
    month: 1,
  },
  {
    month: 2,
  },
  {
    month: 4,
  },
  {
    month: 6,
  },
  {
    month: 9,
    current: true,
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

const Item: React.FC<DataItem> = ({month, current}) => (
  <TouchableOpacity>
    <View style={{padding: 5, height: 100, justifyContent: 'center'}}>
      <AnimatedCircularProgress
        rotation={0}
        size={current ? 68 : 45}
        width={2}
        fill={80}
        tintColor={colors.iceCold}
        backgroundColor="transparent">
        {() => <Text style={{fontSize: 10}}>{month} mo</Text>}
      </AnimatedCircularProgress>
    </View>
  </TouchableOpacity>
);

const Dashboard: React.FC<{}> = () => {
  const headerHeight = useHeaderHeight();
  const {bottom} = useSafeArea();
  const {t} = useTranslation('dashboard');

  const age = 9;
  const childName = 'Mina Jaquelina';
  const flatListRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (flatListRef.current) {
      // flatListRef.current.scrollToIndex({
      //   index: 4,
      // });
    }
  }, []);

  return (
    <>
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
              {t('childAge', {unit: 'month', value: age})}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 20,
              marginHorizontal: 32,
            }}>
            <ChevronLeft />
            <FlatList
              ref={flatListRef}
              style={{
                marginHorizontal: 13,
              }}
              data={DATA}
              horizontal
              renderItem={({item}) => <Item {...item} />}
              keyExtractor={(item) => `${item.month}`}
            />
            <ChevronRight />
          </View>
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
    marginBottom: 30,
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

export default Dashboard;
