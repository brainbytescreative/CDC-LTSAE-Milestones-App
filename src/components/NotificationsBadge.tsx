import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import {useHeaderHeight} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, PropType, sharedScreenOptions, sharedStyle} from '../resources/constants';
import CloseCross from '../resources/svg/CloseCross';
import {ChevronLeft} from '../resources/svg';
import {useTranslation} from 'react-i18next';
import {useGetUnreadNotifications} from '../hooks/notificationsHooks';

// const notifications = Array(45);

const NotificationsBadgeCounter: React.FC<Pick<TouchableOpacityProps, 'onPress'>> = ({onPress}) => {
  const {data: notifications} = useGetUnreadNotifications();
  return (
    <TouchableOpacity onPress={onPress} style={styles.badgeContainer}>
      <Text style={styles.badgeText}>{notifications?.length || 0}</Text>
    </TouchableOpacity>
  );
};

const NotificationsBadge: React.FC<{}> = () => {
  const {bottom} = useSafeAreaInsets();
  const navigation = useNavigation();
  const [visible, setIsVisible] = useState(false);
  const {top} = useSafeAreaInsets();
  const {t} = useTranslation('common');
  const {data: notifications} = useGetUnreadNotifications();

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
                        {item.titleLocalizedKey && t(item.titleLocalizedKey)}
                      </Text>
                      <Text>{item.bodyLocalizedKey && t(item.bodyLocalizedKey)}</Text>
                    </View>

                    <TouchableOpacity>
                      <CloseCross />
                    </TouchableOpacity>
                  </View>
                </>
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
