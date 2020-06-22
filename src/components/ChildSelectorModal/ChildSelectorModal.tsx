import React, {Suspense, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {useDeleteChild, useGetChildren, useGetCurrentChild, useSetSelectedChild} from '../../hooks/childrenHooks';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import NotificationsBadge from '../NotificationsBadge/NotificationsBadge';
import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ChildSelectorsItem from './ChildSelectorsItem';
import ChildSectorFooter from './ChildSectorFooter';
import {Text} from 'react-native-paper';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const ChildName: React.FC = () => {
  const {data: selectedChild} = useGetCurrentChild();
  return (
    <Text
      numberOfLines={1}
      style={{
        fontSize: 22,
        textAlign: 'center',
        fontFamily: 'Montserrat-Bold',
      }}>
      {selectedChild?.name}
    </Text>
  );
};

const ChildrenList: React.FC<{onEdit: (id?: number) => void; onSelect: (id?: number) => void}> = ({
  onSelect,
  onEdit,
}) => {
  const {data: children} = useGetChildren({suspense: true});
  const [deleteChild] = useDeleteChild();

  return (
    <FlatList
      data={children}
      renderItem={({item}) => (
        <ChildSelectorsItem
          {...item}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={(id) => {
            deleteChild({id});
          }}
        />
      )}
      keyExtractor={(item) => `${item.id}`}
      ListFooterComponent={
        <ChildSectorFooter
          onPress={() => {
            onEdit();
          }}
        />
      }
    />
  );
};

const ChildSelectorModal: React.FC<{visible?: boolean}> = ({visible}) => {
  const {top} = useSafeAreaInsets();
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);

  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [selectChild] = useSetSelectedChild();

  useEffect(() => {
    if (visible) {
      setChildSelectorVisible(true);
    }
  }, [visible]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      ...sharedScreenOptions,
      headerTitle: () => {
        return (
          <TouchableOpacity
            onPress={() => setChildSelectorVisible(!childSelectorVisible)}
            style={{
              // flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Suspense fallback={<ActivityIndicator size={'small'} />}>
              <ChildName />
            </Suspense>
            <EvilIcons name={childSelectorVisible ? 'chevron-up' : 'chevron-down'} size={30} />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, setChildSelectorVisible, childSelectorVisible]);

  const onEdit = (id?: number) => {
    setChildSelectorVisible(false);
    navigation.navigate('DashboardStack', {
      screen: 'AddChild',
      params: {
        childId: id,
      },
    });
  };

  const onSelect = (id?: number) => {
    id && selectChild({id});
    setChildSelectorVisible(false);
  };

  return (
    <>
      <NotificationsBadge />
      <Modal animated animationType={'fade'} transparent visible={childSelectorVisible}>
        <TouchableWithoutFeedback
          onPressIn={() => {
            setChildSelectorVisible(false);
          }}>
          <View style={{backgroundColor: colors.whiteTransparent, flex: 1}}>
            <View
              style={[
                {
                  marginTop: top,
                  backgroundColor: 'white',
                  marginHorizontal: 32,
                  borderWidth: 0.5,
                  borderColor: colors.gray,
                  borderRadius: 10,
                },
                sharedStyle.shadow,
              ]}>
              <Suspense fallback={<ActivityIndicator style={{margin: 32}} size={'large'} />}>
                <ChildrenList onEdit={onEdit} onSelect={onSelect} />
              </Suspense>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default ChildSelectorModal;
