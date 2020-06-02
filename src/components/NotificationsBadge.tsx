import React, {useState} from 'react';
import {FlatList, Modal, StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, sharedScreenOptions, sharedStyle} from '../resources/constants';
import CloseCross from './Svg/CloseCross';
import {useTranslation} from 'react-i18next';
import {
  NotificationDB,
  notificationDbToRequest,
  useGetUnreadNotifications,
  useSetNotificationRead,
} from '../hooks/notificationsHooks';
import {TFunction} from 'i18next';
import ChevronLeft from './Svg/ChevronLeft';

// const notifications = Array(45);

const NotificationsBadgeCounter: React.FC<Pick<TouchableOpacityProps, 'onPress'>> = ({onPress}) => {
  const {data: notifications} = useGetUnreadNotifications();
  return (
    <TouchableOpacity onPress={onPress} style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{notifications?.length || 0}</Text>
    </TouchableOpacity>
  );
};

const NotificationItem: React.FC<{
  index: number;
  onCrossPress: (id: string) => void;
  item: NotificationDB;
  t: TFunction;
}> = ({index, onCrossPress, item, t}) => {
  const request = notificationDbToRequest(item, t);

  return (
    <>
      <View
        style={[
          {
            borderBottomWidth: 0.5,
            borderBottomColor: colors.gray,
            marginBottom: 20,
          },
          index > 0 && {marginTop: 20},
        ]}
      />
      <View style={{flexDirection: 'row', marginHorizontal: 16, alignItems: 'center'}}>
        <View
          style={{
            width: 0,
            flexGrow: 1,
          }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Montserrat-Bold',
            }}>
            {request?.content.title}
          </Text>
          <Text>{request?.content.body}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            onCrossPress(item.notificationId);
          }}>
          <CloseCross />
        </TouchableOpacity>
      </View>
    </>
  );
};

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
                <NotificationItem index={index} t={t} item={item} onCrossPress={onCrossPress} />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#fff',
    width: 23,
    height: 23,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
  },
  crossContainer: {
    marginHorizontal: 28,
  },
  badgeText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
});

export default NotificationsBadge;
