import React from 'react';
import {StyleSheet, TouchableOpacity, TouchableOpacityProps} from 'react-native';
import {useGetUnreadNotifications} from '../../hooks/notificationsHooks';
import {Text} from 'react-native-paper';

const NotificationsBadgeCounter: React.FC<Pick<TouchableOpacityProps, 'onPress'>> = ({onPress}) => {
  const {data: notifications} = useGetUnreadNotifications();
  return (
    <TouchableOpacity onPress={onPress} style={counterStyle.badgeContainer}>
      <Text style={counterStyle.badgeText}>{notifications?.length || 0}</Text>
    </TouchableOpacity>
  );
};

const counterStyle = StyleSheet.create({
  badgeText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
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
