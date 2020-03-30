import React from 'react';
import {Text} from 'react-native-paper';
import Layout from '../components/Layout';
import {useHeaderHeight} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {ScrollView} from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  actionItem: {
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
  },
});

const Dashboard: React.FC<{}> = () => {
  const headerHight = useHeaderHeight();
  return (
    <Layout style={{marginTop: headerHight}}>
      <ScrollView>
        <View style={{paddingHorizontal: 30}}>
          <View style={{alignItems: 'center', marginVertical: 40}}>
            <View
              style={{
                borderWidth: 1,
                width: 200,
                height: 200,
                borderRadius: 200,
              }}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
              {'Child name'}
            </Text>
            <Text>{'is 9 month old'}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginVertical: 30,
            }}>
            <EvilIcons size={30} name={'chevron-left'} />
            <Text>{'2 mo'}</Text>
            <Text>{'4 mo'}</Text>
            <Text>{'6 mo'}</Text>
            <Text>{'9 mo'}</Text>
            <Text>{'1 yr'}</Text>
            <Text>{'18 mo'}</Text>
            <Text>{'2 yrs'}</Text>
            <EvilIcons size={30} name={'chevron-right'} />
          </View>
          <View
            style={{backgroundColor: 'white', padding: 20, borderRadius: 15}}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              Milestone check list
            </Text>
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

export default Dashboard;
