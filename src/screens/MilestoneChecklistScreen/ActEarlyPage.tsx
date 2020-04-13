import React, {useMemo} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '../../components/Text';
import {Button} from 'react-native-paper';
import milestoneChecklist, {Concern} from '../../resources/milestoneChecklist';
import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import IonIcons from 'react-native-vector-icons/Ionicons';

const ActEarlyPage: React.FC<{}> = () => {
  const {t} = useTranslation('milestones');
  const {data: child} = useGetCurrentChild();
  const hisHersTag = _.isNumber(child?.gender) && t(`common:hisHersTag${child?.gender}`);
  const checklistAge = 2;

  const concerns = useMemo<Concern[] | undefined>(() => {
    return (
      child &&
      _.chain(milestoneChecklist)
        .find({id: checklistAge})
        .get('concerns')
        .map((item) => {
          return {
            ...item,
            value: item.value && t(item.value, {hisHersTag}),
          };
        })
        .value()
    );
  }, [t, child, hisHersTag]);

  return (
    <FlatList
      ListHeaderComponent={
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.header, {marginTop: 20}]}>4 month</Text>
          <Text style={[styles.header]}>Milestone checklist</Text>
          <Text style={[styles.header, {fontWeight: 'normal'}]}>Complete</Text>
          <Text style={[styles.header, {marginTop: 20}]}>When to act early</Text>
          <Text style={{textAlign: 'center', marginTop: 20, marginHorizontal: 32}}>
            If you select any of the items below, it's important To act early by talking with your child's doctor. Don't
            wait. Acting early can make a real difference! For more information visit cdc.gov/concerned
          </Text>
          <Text style={{backgroundColor: 'gray', color: 'white', padding: 5}}>! You may need to act early</Text>
          <Text style={{marginTop: 15, fontSize: 10}}>Triggered when you answer for any this items</Text>
        </View>
      }
      data={concerns || []}
      renderItem={({item}) => (
        <View
          style={{
            borderWidth: 1,
            marginHorizontal: 32,
            marginBottom: 40,
            paddingTop: 20,
            paddingBottom: 30,
          }}>
          <View
            style={{
              paddingHorizontal: 28,
            }}>
            <Text>{item.value}</Text>
          </View>
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              position: 'absolute',
              width: '100%',
              bottom: -20,
            }}>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                paddingHorizontal: 12,
                backgroundColor: 'white',
                marginLeft: 30,
              }}>
              <IonIcons name={'ios-checkmark'} size={40} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderWidth: 1,
                paddingHorizontal: 12,
                justifyContent: 'center',
                marginRight: 20,
                backgroundColor: 'white',
              }}>
              <Text>Add note</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      keyExtractor={(item) => `concern-${item.id}`}
      ListFooterComponent={() => (
        <View style={{alignItems: 'center'}}>
          <Button mode={'outlined'}>My Child summary</Button>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 5,
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
  },
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActEarlyPage;
