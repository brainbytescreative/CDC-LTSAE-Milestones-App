import React, {useState} from 'react';
import {FlatList, Modal, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {useGetUnreadNotifications, useSetNotificationRead} from '../../hooks/notificationsHooks';
import ChevronLeft from '../Svg/ChevronLeft';
import NotificationsListItem from './NotificationsListItem';
import NotificationsBadgeCounter from './NotificationsBadgeCounter';

const NotificationsBadge: React.FC = () => {
  const {bottom} = useSafeAreaInsets();
  const navigation = useNavigation();
  const [visible, setIsVisible] = useState(false);
  const {top} = useSafeAreaInsets();
  const {t} = useTranslation('common');
  const {data: notifications} = useGetUnreadNotifications();
  const [setNotificationRead] = useSetNotificationRead();

  React.useLayoutEffect(() => {
    const onPress = () => {
      setIsVisible(!visible);
    };
    navigation.setOptions({
      ...sharedScreenOptions,
      headerRight: () => {
        return <NotificationsBadgeCounter onPress={onPress} />;
      },
    });
  }, [navigation, visible]);

  const onCrossPress = (notificationId: string) => {
    setNotificationRead({notificationId});
  };

  return (
    <>
      <Modal animated visible={visible} transparent>
        <View style={{flex: 1, backgroundColor: colors.whiteTransparent}}>
          <View
            style={[
              {
                flex: 1,
                marginTop: top + 16,
                marginHorizontal: 32,
                backgroundColor: colors.white,
                marginBottom: 32,
              },
              sharedStyle.border,
              sharedStyle.shadow,
            ]}>
            <View
              style={{
                marginHorizontal: 16,
                marginVertical: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: 'Montserrat-Bold',
                }}>
                {t('notifications')}
              </Text>
              <TouchableOpacity
                hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
                onPress={() => {
                  setIsVisible(false);
                }}>
                <ChevronLeft />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications || []}
              style={{flex: 1}}
              keyExtractor={(item, index) => `${index}`}
              ListFooterComponent={() => <View style={{height: bottom}} />}
              renderItem={({index, item}) => (
                <NotificationsListItem index={index} t={t} item={item} onCrossPress={onCrossPress} />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationsBadge;
