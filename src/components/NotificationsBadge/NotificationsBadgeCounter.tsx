import React from 'react';
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import {useGetUnreadNotifications} from '../../hooks/notificationsHooks';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {sharedStyle} from '../../resources/constants';

const NotificationsBadgeCounter: React.FC<Pick<TouchableOpacityProps, 'onPress'>> = ({onPress}) => {
  const {data: notifications} = useGetUnreadNotifications();
  const {t} = useTranslation();
  const count = notifications?.length || 0;
  return (
    <TouchableOpacity
      hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
      accessibilityRole={'button'}
      accessibilityLabel={t('accessibility:unreadNotifications', {count})}
      onPress={onPress}
      style={{minHeight: 45, alignItems: 'center', justifyContent: 'center'}}>
      <View style={counterStyle.badgeContainer}>
        <Text style={counterStyle.badgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const counterStyle = StyleSheet.create({
  badgeText: {
    fontSize: 15,
    ...sharedStyle.boldText,
  },
  badgeContainer: {
    backgroundColor: '#fff',
    width: 23,
    height: 23,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
  },
});

export default NotificationsBadgeCounter;
