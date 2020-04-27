import React, {useState} from 'react';
import {FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {useDeleteChild, useGetChildren, useGetCurrentChild, useSetSelectedChild} from '../../hooks/childrenHooks';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import NotificationsBadge from '../NotificationsBadge';
import {colors, sharedStyle} from '../../resources/constants';
import {useSafeArea} from 'react-native-safe-area-context';
import ChildSelectorsItem from './ChildSelectorsItem';
import ChildSectorFooter from './ChildSectorFooter';
import {Text, Title} from 'react-native-paper';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const ChildSelectorModal: React.FC<{}> = () => {
  const {top} = useSafeArea();
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);
  const {data: selectedChild} = useGetCurrentChild();
  const {data: children} = useGetChildren();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [selectChild] = useSetSelectedChild();
  const [deleteChild] = useDeleteChild();

  React.useLayoutEffect(() => {
    navigation.setOptions({
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
            <Title
              numberOfLines={1}
              style={{
                fontSize: 22,
                textAlign: 'center',
              }}>
              {selectedChild?.name}
            </Title>
            <EvilIcons name={childSelectorVisible ? 'chevron-up' : 'chevron-down'} size={30} />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, setChildSelectorVisible, childSelectorVisible, selectedChild]);

  const onEdit = (id?: number) => {
    setChildSelectorVisible(false);
    navigation.navigate('AddChild', {
      childId: id,
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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default ChildSelectorModal;
