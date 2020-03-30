/* eslint-disable @typescript-eslint/no-use-before-define */
import React from 'react';
import {Colors, ProgressBar, Text} from 'react-native-paper';
import Layout from '../components/Layout';
import {useHeaderHeight} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

interface DataItem {
  month: number;
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
        size={current ? 70 : 50}
        width={2}
        fill={80}
        tintColor={Colors.greenA700}
        onAnimationComplete={() => console.log('onAnimationComplete')}
        backgroundColor="transparent">
        {() => <Text>{month} mo</Text>}
      </AnimatedCircularProgress>
    </View>
  </TouchableOpacity>
);

const Dashboard: React.FC<{}> = () => {
  const headerHight = useHeaderHeight();
  return (
    <Layout style={{marginTop: headerHight}}>
      <ScrollView>
        <View style={{paddingHorizontal: 30}}>
          <View style={{alignItems: 'center', marginVertical: 40}}>
            <View style={styles.image} />
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              {'Child name'}
            </Text>
            <Text>{'is 9 month old'}</Text>
          </View>
          {/*<View style={styles.imageContainer}>*/}
          {/*  <EvilIcons size={30} name={'chevron-left'} />*/}
          {/*  <Text>{'2 mo'}</Text>*/}
          {/*  <Text>{'4 mo'}</Text>*/}
          {/*  <Text>{'6 mo'}</Text>*/}
          {/*  <Text>{'9 mo'}</Text>*/}
          {/*  <Text>{'1 yr'}</Text>*/}
          {/*  <Text>{'18 mo'}</Text>*/}
          {/*  <Text>{'2 yrs'}</Text>*/}
          {/*  <EvilIcons size={30} name={'chevron-right'} />*/}
          {/*</View>*/}
          <FlatList
            style={{
              marginVertical: 20,
            }}
            data={DATA}
            horizontal
            renderItem={({item}) => <Item {...item} />}
            keyExtractor={(item) => `${item.month}`}
          />
          <View style={styles.shadeovedYelowText}>
            <Text
              style={{
                padding: 5,
                fontSize: 16,
              }}>
              Lorem ipsum dolor sit amet!
            </Text>
          </View>
          <View
            style={{backgroundColor: 'white', padding: 20, borderRadius: 15}}>
            <View style={styles.milestoneCheckListContainer}>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                Milestone check list
              </Text>
              <EvilIcons name={'chevron-right'} size={30} />
            </View>
            <ProgressBar
              style={{
                height: 12,
                borderRadius: 5,
                marginVertical: 10,
              }}
              progress={0.5}
              color={Colors.greenA700}
            />
            <Text>10/20 Milestones answered</Text>
          </View>
          <View
            style={{
              marginVertical: 20,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginHorizontal: 20,
                marginBottom: 20,
              }}>
              {'9 Month Milestone\nAction Items'}
            </Text>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={styles.actionItem}>
                <EvilIcons name={'trophy'} size={50} />
                <Text style={{fontSize: 18}}>When to Act Early</Text>
              </View>
              <View style={[styles.actionItem, {marginHorizontal: 10}]}>
                <EvilIcons name={'trophy'} size={50} />
                <Text style={{fontSize: 18}}>Milestone Summary</Text>
              </View>
              <View style={styles.actionItem}>
                <EvilIcons name={'trophy'} size={55} />
                <Text style={{fontSize: 18}}>Tips and Activities</Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              marginHorizontal: 20,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
              }}>
              Appointments
            </Text>
            <Text style={{fontSize: 18}}>+ Add apt</Text>
          </View>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 15,
            }}>
            <Text style={{fontSize: 18}}>Check up</Text>
            <Text style={{fontSize: 18}}>1/2/20 3:30pm</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  actionItem: {
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
  milestoneCheckListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shadeovedYelowText: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: 'yellow',
    borderRadius: 10,
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
    borderWidth: 1,
    width: 200,
    height: 200,
    borderRadius: 200,
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
