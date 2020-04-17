import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import Text from '../../components/Text';
import {Button} from 'react-native-paper';
import {Concern} from '../../resources/milestoneChecklist';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useGetConcern, useGetConcerns, useSetConcern} from '../../hooks/checklistHooks';
import {useNavigation} from '@react-navigation/native';
import {DashboardStackNavigationProp} from '../Dashboard/DashboardScreen';
import {missingConcerns} from '../../resources/constants';

const Item: React.FC<Concern & {childId?: number}> = ({id, value, childId}) => {
  const [setConcern] = useSetConcern();
  const {data: concern} = useGetConcern({concernId: id, childId});

  const isMissingAnswerConcern = missingConcerns.includes(id || 0);
  const onPress = isMissingAnswerConcern
    ? undefined
    : () => {
        id && childId && setConcern({concernId: id, answer: !concern?.answer, childId: childId});
      };

  return (
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
        <Text>{value}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          disabled={isMissingAnswerConcern}
          onPress={onPress}
          style={[styles.checkMarkContainer, concern?.answer && {backgroundColor: 'grey'}]}>
          <IonIcons style={[concern?.answer && {color: 'white'}]} name={'ios-checkmark'} size={40} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addNoteContainer}>
          <Text>Add note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ActEarlyPage: React.FC<{}> = () => {
  const {milestoneAgeFormatted, concerns, child} = useGetConcerns();
  const navigation = useNavigation<DashboardStackNavigationProp>();

  return (
    <FlatList
      ListHeaderComponent={
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.header, {marginTop: 20}]}>{milestoneAgeFormatted}</Text>
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
      data={concerns?.concerns || []}
      renderItem={({item}) => <Item {...item} childId={child?.id} />}
      keyExtractor={(item) => `concern-${item.id}`}
      ListFooterComponent={() => (
        <View style={{alignItems: 'center'}}>
          <Button
            onPress={() => {
              navigation.navigate('ChildSummary');
            }}
            mode={'outlined'}>
            My Child summary
          </Button>
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
  addNoteContainer: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginRight: 20,
    backgroundColor: 'white',
  },
  checkMarkSelected: {},
  checkMarkContainer: {
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginLeft: 30,
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    bottom: -25,
  },
});

export default ActEarlyPage;
