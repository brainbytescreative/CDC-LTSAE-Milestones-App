import React, {useState} from 'react';
import {FlatList, Modal, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, sharedScreenOptions, sharedStyle} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {
  useGetUnreadNotifications,
  useNavigateNotification,
  useSetNotificationRead,
} from '../../hooks/notificationsHooks';
import ChevronLeft from '../Svg/ChevronLeft';
import NotificationsListItem from './NotificationsListItem';
import NotificationsBadgeCounter from './NotificationsBadgeCounter';
import {trackInteractionByType, trackSelectByType} from '../../utils/analytics';

const NotificationsBadge: React.FC = () => {
  const navigation = useNavigation();
  const [visible, setIsVisible] = useState(false);
  const {top} = useSafeAreaInsets();
  const {t} = useTranslation('common');
  const {data: notifications} = useGetUnreadNotifications();
  const [setNotificationRead] = useSetNotificationRead();
  const [navigateNotification] = useNavigateNotification();
  const navigate = useNavigation();

  React.useLayoutEffect(() => {
    const onPress = () => {
      setIsVisible(!visible);
      trackSelectByType('Notifications');
    };
    navigation.setOptions({
      ...sharedScreenOptions,
      headerRight: () => {
        return <NotificationsBadgeCounter onPress={onPress} />;
      },
    });
  }, [navigation, visible]);

  const onCrossPress = (notificationId: string) => {
    trackInteractionByType('Delete Appointment');
    setNotificationRead({notificationId});
  };

  const onNavigatePress = (notificationId: string) => {
    setIsVisible(false);
    navigateNotification(notificationId, navigate);
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
                accessibilityRole={'button'}
                accessibilityLabel={t('accessibility:close')}
                onPress={() => {
                  setIsVisible(false);
                }}>
                <View style={{minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center'}}>
                  <ChevronLeft />
                </View>
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications || []}
              style={{flex: 1, marginBottom: 16}}
              keyExtractor={(item, index) => `${index}`}
              renderItem={({index, item}) => (
                <NotificationsListItem
                  onNotificationPress={onNavigatePress}
                  index={index}
                  t={t}
                  item={item}
                  onCrossPress={onCrossPress}
                />
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationsBadge;
