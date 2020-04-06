import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const NotificationsBadge: React.FC<{}> = () => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        width: 23,
        height: 23,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 32,
      }}>
      <Text
        style={{
          fontFamily: 'montserrat',
          fontSize: 15,
          fontWeight: 'bold',
        }}>
        4
      </Text>
    </TouchableOpacity>
  );
};

export default NotificationsBadge;
