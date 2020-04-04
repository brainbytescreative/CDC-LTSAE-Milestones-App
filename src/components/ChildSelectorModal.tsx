import React, {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useHeaderHeight} from '@react-navigation/stack';
import {Portal} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {useNavigation} from '@react-navigation/native';
import Text from './Text';
import {formatDistanceStrict} from 'date-fns';
import {routeKeys} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import {dateFnsLocales} from '../resources/dateFnsLocales';
import {
  ChildResult,
  useDeleteChild,
  useGetChildren,
  useGetCurrentChild,
  useSetSelectedChild,
} from '../hooks/childrenDbHooks';
import {BabyPlaceholder} from '../resources/svg';

interface ItemProps extends ChildResult {
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Item: React.FC<ItemProps> = ({
  id,
  name,
  birthday,
  photo,
  onDelete,
  onEdit,
  onSelect,
}) => {
  const {t} = useTranslation('childSelector');
  return (
    <TouchableOpacity
      onPress={() => {
        onSelect(id);
      }}
      style={{flexDirection: 'row', paddingTop: 20}}>
      <View style={{flex: 1, alignItems: 'center'}}>
        {photo ? (
          <Image
            source={{uri: photo}}
            style={{
              width: 100,
              height: 100,
              borderWidth: 0.3,
              borderColor: 'gray',
              borderRadius: 100,
            }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderWidth: 0.3,
              borderColor: 'gray',
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <BabyPlaceholder width={'90%'} height={'90%'} />
          </View>
        )}
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.chilNameText}>{name}</Text>
        <Text style={styles.chilNameText}>
          {formatDistanceStrict(new Date(), birthday, {
            roundingMethod: 'floor',
            locale: dateFnsLocales[i18next.language],
          })}
        </Text>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <TouchableOpacity
            onPress={() => {
              onEdit(id);
            }}>
            <Text>{t('edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onDelete(id);
            }}
            style={{marginLeft: 10}}>
            <Text>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Footer: React.FC<{onPress: () => void}> = ({onPress}) => {
  const {t} = useTranslation('childSelector');
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        height: 100,
      }}>
      <View style={{flex: 1}} />
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text>{t('addChild')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ChildSelectorModal: React.FC<{}> = () => {
  const headerHeight = useHeaderHeight();
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);
  const {data: selectedChild} = useGetCurrentChild();
  const {data: children} = useGetChildren();
  const navigation = useNavigation();
  const [selectChild] = useSetSelectedChild();
  const [deleteChild] = useDeleteChild();

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
              {selectedChild?.name}
            </Text>
            <EvilIcons
              name={childSelectorVisible ? 'chevron-up' : 'chevron-down'}
              size={30}
            />
          </TouchableOpacity>
        );
      },
    });
  }, [
    navigation,
    setChildSelectorVisible,
    childSelectorVisible,
    selectedChild,
  ]);

  const onEdit = (id?: string) => {
    setChildSelectorVisible(false);
    navigation.navigate(routeKeys.AddChild, {
      childId: id,
    });
  };

  const onSelect = (id?: string) => {
    id && selectChild({id});
    setChildSelectorVisible(false);
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
          data={children}
          renderItem={({item}) => (
            <Item
              {...item}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={(id) => {
                deleteChild({id});
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <Footer
              onPress={() => {
                onEdit();
              }}
            />
          }
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
