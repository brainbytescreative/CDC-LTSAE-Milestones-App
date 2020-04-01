import React, {useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useHeaderHeight} from '@react-navigation/stack';
import {Button, Portal} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {useNavigation} from '@react-navigation/native';
import Text from '../../components/Text';
import {subMonths, formatDistanceStrict} from 'date-fns';
import {routeKeys} from '../../resources/constants';

const data = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    name: 'Child #1',
    birthDay: subMonths(new Date(), 1),
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    name: 'Child #2',
    birthDay: subMonths(new Date(), 6),
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f64',
    name: 'Child #3',
    birthDay: subMonths(new Date(), 18),
  },
];

type Child = typeof data[0];

interface ItemProps extends Child {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({id, name, birthDay, onDelete, onEdit}) => (
  <TouchableOpacity
    onPress={() => {
      onEdit(id);
    }}
    style={{flexDirection: 'row', paddingTop: 20}}>
    <View style={{flex: 1, alignItems: 'center'}}>
      <View
        style={{width: 100, height: 100, borderWidth: 1, borderRadius: 100}}
      />
    </View>
    <View style={{flex: 1}}>
      <Text style={styles.chilNameText}>{name}</Text>
      <Text style={styles.chilNameText}>
        {formatDistanceStrict(new Date(), birthDay, {
          roundingMethod: 'floor',
        })}
      </Text>
      <View style={{flexDirection: 'row', marginTop: 10}}>
        <TouchableOpacity
          onPress={() => {
            onEdit(id);
          }}>
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onDelete(id);
          }}
          style={{marginLeft: 10}}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const Footer: React.FC<{onPress: () => void}> = ({onPress}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        height: 100,
      }}>
      <View style={{flex: 1}} />
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text>+ Add child</Text>
      </View>
    </TouchableOpacity>
  );
};

const ChildSelectorModal: React.FC<{}> = () => {
  const headerHeight = useHeaderHeight();
  const [childSelectorVisible, setChildSelectorVisible] = useState(true);

  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <TouchableOpacity
            onPress={() => setChildSelectorVisible(!childSelectorVisible)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'montserrat',
                fontSize: 22,
                fontWeight: 'bold',
              }}>
              Child name
            </Text>
            <EvilIcons
              name={childSelectorVisible ? 'chevron-up' : 'chevron-down'}
              size={30}
            />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, setChildSelectorVisible, childSelectorVisible]);

  const onEdit = (id?: string) => {
    setChildSelectorVisible(false);
    navigation.navigate(routeKeys.AddChild, {
      childId: id,
    });
  };

  return (
    <Portal>
      <View
        style={{
          marginTop: headerHeight,
          backgroundColor: 'white',
          flex: 1,
          display: childSelectorVisible ? 'flex' : 'none',
        }}>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <Item
              {...item}
              onEdit={onEdit}
              onDelete={(id) => {
                console.warn('delete', id);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={<Footer onPress={onEdit} />}
        />
      </View>
    </Portal>
  );
};

export default ChildSelectorModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {},
  chilNameText: {
    fontSize: 18,
  },
});
