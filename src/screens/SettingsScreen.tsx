import {Formik, useField} from 'formik';
import {FormikProps} from 'formik/dist/types';
import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LayoutChangeEvent, StyleProp, TextStyle, View} from 'react-native';
import {Text} from 'react-native-paper';

import AEScrollView from '../components/AEScrollView';
import AESwitch from '../components/AESwitch';
import LanguageSelector from '../components/LanguageSelector';
import NotificationsBadge from '../components/NotificationsBadge/NotificationsBadge';
import ParentProfileSelector from '../components/ParentProfileSelector';
import PurpleArc from '../components/Svg/PurpleArc';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import {useScheduleNotifications} from '../hooks/notificationsHooks';
import {useGetParentProfile, useSetParentProfile} from '../hooks/parentProfileHooks';
import {
  NotificationSettings,
  SettingName,
  useGetNotificationSettings,
  useSetNotificationSettings,
} from '../hooks/settingsHooks';
import {colors, sharedStyle} from '../resources/constants';
import {trackSelectByType, trackSelectLanguage} from '../utils/analytics';

// import DropDownPicker from 'react-native-dropdown-picker';

interface Props {
  name: SettingName;
  onLayout?: (e: LayoutChangeEvent) => void;
  textStyle?: StyleProp<TextStyle>;
}

const NotificationSetting: React.FC<Props> = ({name, onLayout, textStyle}) => {
  const {t} = useTranslation('fields');

  const [field, , helpers] = useField<boolean>(name);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 21,
      }}>
      <Text
        numberOfLines={1}
        onLayout={onLayout}
        adjustsFontSizeToFit
        style={[
          {
            fontSize: 15,
            textTransform: 'capitalize',
            width: '75%',
          },
          textStyle,
        ]}>
        {t(name)}
      </Text>
      <AESwitch
        value={field.value}
        onValueChange={(value) => {
          helpers.setValue(value);
          value ? trackSelectByType('On') : trackSelectByType('Off');
        }}
        onText={t('onLabel')}
        offText={t('offLabel')}
      />
    </View>
  );
};

const notificationPreferences = Array.from<SettingName>([
  'milestoneNotifications',
  'appointmentNotifications',
  'recommendationNotifications',
  'tipsAndActivitiesNotification',
]);

const SettingsScreen: React.FC = () => {
  const {t} = useTranslation('settings');
  const formikRef = useRef<FormikProps<NotificationSettings> | null>(null);
  const {data: settings} = useGetNotificationSettings();
  const [setSettings] = useSetNotificationSettings();
  const {data: profile} = useGetParentProfile();
  const [setProfile] = useSetParentProfile();
  const [height, setHeight] = useState<number | undefined>();
  const [scheduleNotifications] = useScheduleNotifications();

  useEffect(() => {
    if (settings) {
      formikRef.current?.setValues(settings);
    }
  }, [settings]);

  const rescheduleNotifications = useRef(_.debounce(scheduleNotifications, 3000));

  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <AEScrollView>
        <View style={{flex: 1}}>
          <NotificationsBadge />
          <View style={{flexGrow: 1}}>
            <Text style={[sharedStyle.screenTitle]}>{t('notificationSettings')}</Text>
            <Formik
              innerRef={(ref) => (formikRef.current = ref)}
              initialValues={{
                milestoneNotifications: true,
                appointmentNotifications: true,
                recommendationNotifications: true,
                tipsAndActivitiesNotification: true,
              }}
              validate={(values) => {
                setSettings(values).then(() => rescheduleNotifications.current());
              }}
              onSubmit={() => {
                return;
              }}>
              {() => {
                return (
                  <View style={{marginHorizontal: 32}}>
                    {notificationPreferences.map((value, index) => (
                      <NotificationSetting
                        key={`notif-${index}`}
                        onLayout={(e) => {
                          e.nativeEvent.layout.height < (height || 100) && setHeight(e.nativeEvent.layout.height);
                        }}
                        textStyle={!!height && {height}}
                        name={value}
                      />
                    ))}
                  </View>
                );
              }}
            </Formik>
          </View>
          <View style={{marginTop: 47}}>
            <PurpleArc width={'100%'} />
            <View style={{backgroundColor: colors.purple, paddingTop: 30, paddingHorizontal: 32}}>
              <Text
                style={[
                  {
                    textTransform: 'capitalize',
                  },
                  sharedStyle.largeBoldText,
                ]}>
                {t('userProfile')}
              </Text>
              <Text style={{fontSize: 15, marginVertical: 26}}>{t('statePrivacyLanguage')}</Text>

              <ParentProfileSelector
                value={profile}
                onChange={(values) => {
                  setProfile(values);
                }}
              />
              <Text style={{textAlign: 'right', marginTop: 10}}>{t('requiredForState')}</Text>
              <Text
                style={[
                  {
                    marginBottom: 16,
                    textTransform: 'capitalize',
                  },
                  sharedStyle.largeBoldText,
                ]}>
                {t('common:appLanguage')}
              </Text>
              <LanguageSelector
                onLanguageChange={(lng) => {
                  trackSelectLanguage(lng);
                }}
                style={{marginBottom: 40}}
              />
            </View>
          </View>
        </View>
      </AEScrollView>
    </View>
  );
};

export default SettingsScreen;
