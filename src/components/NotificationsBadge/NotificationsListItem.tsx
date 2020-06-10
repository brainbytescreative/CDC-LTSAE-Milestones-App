import React from 'react';
import {NotificationDB, notificationDbToRequest} from '../../hooks/notificationsHooks';
import {TFunction} from 'i18next';
import {TouchableOpacity, View} from 'react-native';
import {colors} from '../../resources/constants';
import {Text} from 'react-native-paper';
import CloseCross from '../Svg/CloseCross';
import {formatDate} from '../../utils/helpers';
import _ from 'lodash';

const NotificationsListItem: React.FC<{
  index: number;
  onCrossPress: (id: string) => void;
  onNotificationPress: (id: string) => void;
  item: NotificationDB;
  t: TFunction;
}> = ({index, onCrossPress, item, t, onNotificationPress}) => {
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
          <TouchableOpacity
            onPress={() => {
              onNotificationPress(item.notificationId);
            }}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Montserrat-Bold',
              }}>
              {request?.content.title}
            </Text>
            <Text>{request?.content.body}</Text>
            <Text style={{marginTop: 10, color: colors.gray, fontSize: 13}}>
              {_.isDate(request?.trigger) && formatDate(request?.trigger, 'datetime')}
            </Text>
          </TouchableOpacity>
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

export default NotificationsListItem;