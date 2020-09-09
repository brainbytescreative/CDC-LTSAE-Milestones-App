import {TFunction} from 'i18next';
import _ from 'lodash';
import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {NotificationDB, notificationDbToRequest} from '../../hooks/notificationsHooks';
import {colors} from '../../resources/constants';
import {formatDate} from '../../utils/helpers';
import CloseCross from '../Svg/CloseCross';

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
            {__DEV__ && (
              <Text style={{marginTop: 10, color: colors.gray, fontSize: 13}}>
                {_.isDate(request?.trigger) && formatDate(request?.trigger, 'datetime')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          accessibilityRole={'button'}
          accessibilityLabel={t('accessibility:close')}
          onPress={() => {
            onCrossPress(item.notificationId);
          }}>
          <View
            style={{
              right: -16,
              minWidth: 45,
              minHeight: 45,
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CloseCross />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default NotificationsListItem;
