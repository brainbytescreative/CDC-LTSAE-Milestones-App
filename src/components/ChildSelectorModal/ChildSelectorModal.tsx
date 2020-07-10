import React, {Suspense, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {
  ChildResult,
  useDeleteChild,
  useGetChildren,
  useGetCurrentChild,
  useSetSelectedChild,
} from '../../hooks/childrenHooks';
import {DashboardDrawerParamsList, DashboardStackParamList} from '../Navigator/types';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import NotificationsBadge from '../NotificationsBadge/NotificationsBadge';
import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ChildSelectorsItem from './ChildSelectorsItem';
import ChildSectorFooter from './ChildSectorFooter';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {trackSelectByType, trackSelectChild} from '../../utils/analytics';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'DashboardStack'>,
  StackNavigationProp<DashboardStackParamList>
>;

const ChildName: React.FC = () => {
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
};

const ChildrenList: React.FC<{onEdit: (id?: number) => void; onSelect: (id?: number) => void}> = ({
  onSelect,
  onEdit,
}) => {
  const {data: children} = useGetChildren({suspense: true});
  const [deleteChild] = useDeleteChild();
  const {t} = useTranslation();
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
            trackSelectByType('Delete', {page: 'Child Dropdown Page'});
            deleteChild({id});
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <FlatList
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
      keyExtractor={(item) => `${item.id}`}
      ListFooterComponent={
        <ChildSectorFooter
          onPress={() => {
            trackSelectByType('Add Child', {page: 'Child Dropdown Page'});
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
            accessibilityRole={'button'}
            onPress={() => setChildSelectorVisible(!childSelectorVisible)}
            style={{
              // flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 50,
            }}>
            <Suspense fallback={<ActivityIndicator size={'small'} />}>
              <ChildName />
            </Suspense>
            <EvilIcons accessibilityLabel={''} name={childSelectorVisible ? 'chevron-up' : 'chevron-down'} size={30} />
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, setChildSelectorVisible, childSelectorVisible]);

  const onEdit = (id?: number) => {
    setChildSelectorVisible(false);
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
