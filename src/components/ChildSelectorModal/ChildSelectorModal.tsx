import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import _ from 'lodash';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import {useDeleteChild, useGetChildren, useGetCurrentChild, useSetSelectedChild} from '../../hooks/childrenHooks';
import {ChildResult} from '../../hooks/types';
import {colors, sharedStyle} from '../../resources/constants';
import {trackSelectByType, trackSelectChild} from '../../utils/analytics';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../Navigator/types';
import NotificationsBadge from '../NotificationsBadge/NotificationsBadge';
import withSuspense from '../withSuspense';
import ChildSectorFooter from './ChildSectorFooter';
import ChildSelectorsItem from './ChildSelectorsItem';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const ChildName: React.FC = withSuspense(
  () => {
    const {data: selectedChild} = useGetCurrentChild();
    const {t} = useTranslation();
    return (
      <Text
        accessibilityLabel={t('accessibility:childName', {name: selectedChild?.name})}
        numberOfLines={1}
        style={[
          {
            textAlign: 'center',
          },
          sharedStyle.largeBoldText,
        ]}>
        {selectedChild?.name}
      </Text>
    );
  },
  {shared: {suspense: true}},
  <ActivityIndicator size={'small'} />,
);

const ChildrenList: React.FC<{onEdit: (id?: number) => void; onSelect: (id?: number) => void}> = withSuspense(
  ({onSelect, onEdit}) => {
    const {data: children} = useGetChildren({suspense: true});
    const [deleteChild] = useDeleteChild();
    const {t} = useTranslation();
    const {data: {id: currentId} = {}} = useGetCurrentChild();
    const currentIndex = useMemo(() => _.findLastIndex(children, {id: currentId}), [children, currentId]);
    const flatlistRef = useRef<FlatList | null>(null);

    const onDelete = (id: ChildResult['id'], name: ChildResult['name']) => {
      Alert.alert(
        '',
        t('dialog:deleteMessage', {subject: ` ${name}`}),
        [
          {
            text: t('dialog:no'),
            style: 'cancel',
          },
          {
            text: t('dialog:yes'),
            style: 'default',
            onPress: () => {
              trackSelectByType('Delete', {page: 'Children & Add Child'});
              deleteChild({id});
            },
          },
        ],
        {cancelable: false},
      );
    };

    useEffect(() => {
      setTimeout(() => {
        currentIndex > -1 && flatlistRef.current?.scrollToIndex({index: currentIndex, viewPosition: 1});
      }, 500);
    }, [currentIndex]);

    return (
      <>
        <FlatList
          onScrollToIndexFailed={() => undefined}
          ref={flatlistRef}
          data={children}
          renderItem={({item}) => {
            return (
              <ChildSelectorsItem
                {...item}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={Number(children?.length) > 1 ? onDelete : undefined}
              />
            );
          }}
          // ListFooterComponent={
          //
          // }
          keyExtractor={(item) => `${item.id}`}
        />
        <ChildSectorFooter
          onPress={() => {
            trackSelectByType('Add Child', {page: 'Children & Add Child'});
            onEdit();
          }}
        />
      </>
    );
  },
  {shared: {suspense: true}},
  <ActivityIndicator style={{margin: 32}} size={'large'} />,
);

const ChildSelectorModal: React.FC<{visible?: boolean}> = ({visible}) => {
  const {top} = useSafeAreaInsets();
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);

  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [selectChild] = useSetSelectedChild();
  const {bottom} = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setChildSelectorVisible(true);
    }
  }, [visible]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <TouchableOpacity
            accessibilityRole={'button'}
            onPress={() => {
              trackSelectByType('Child Name Drop-down');
              setChildSelectorVisible(!childSelectorVisible);
            }}
            style={{
              // flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 50,
            }}>
            <ChildName />
            <EvilIcons accessibilityLabel={''} name={childSelectorVisible ? 'chevron-up' : 'chevron-down'} size={30} />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, setChildSelectorVisible, childSelectorVisible]);

  const onEdit = (id?: number) => {
    setChildSelectorVisible(false);
    trackSelectByType('Edit', {page: 'Children & Add Child'});
    // navigation.navigate('DashboardStack', {
    //   screen: 'AddChild',
    //   params: {
    //     childId: id,
    //   },
    // });

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'DashboardStack',
          state: {
            index: 1,
            routes: [
              {
                name: 'Dashboard',
              },
              {
                name: 'AddChild',
                params: {
                  childId: id,
                },
              },
            ],
          },
        },
      ],
    });
  };

  const onSelect = (id?: number) => {
    if (id) {
      selectChild({id});
      trackSelectChild(id);
    }

    setChildSelectorVisible(false);
  };

  return (
    <>
      <NotificationsBadge />
      <Modal animated animationType={'fade'} transparent visible={childSelectorVisible}>
        <TouchableWithoutFeedback
          accessible={false}
          onPressIn={() => {
            setChildSelectorVisible(false);
          }}>
          <View
            style={{
              backgroundColor: colors.whiteTransparent,
              flex: 1,
              paddingBottom: 54 + (bottom ?? 16),
              paddingTop: 16,
            }}>
            <View
              style={[
                {
                  // flex: 1,
                  marginTop: top,
                  backgroundColor: 'white',
                  marginHorizontal: 32,
                  borderWidth: 0.5,
                  borderColor: colors.gray,
                  borderRadius: 10,
                },
                sharedStyle.shadow,
              ]}>
              <ChildrenList onEdit={onEdit} onSelect={onSelect} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default ChildSelectorModal;
