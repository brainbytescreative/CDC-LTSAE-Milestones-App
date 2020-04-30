import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {LayoutChangeEvent, StyleProp, TextStyle, View} from 'react-native';
import {Formik, useField} from 'formik';
import {
  NotificationSettings,
  SettingName,
  useGetNotificationSettings,
  useSetNotificationSettings,
} from '../hooks/settingsHooks';
import {FormikProps} from 'formik/dist/types';
import {useGetParentProfile, useSetParentProfile} from '../hooks/parentProfileHooks';
import NotificationsBadge from '../components/NotificationsBadge';
import AESwitch from '../components/AESwitch';
import {colors} from '../resources/constants';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useNavigation} from '@react-navigation/native';
import {PurpleArc} from '../resources/svg';
import ParentProfileSelector from '../components/ParentProfileSelector';
import LanguageSelector from '../components/LanguageSelector';
import AEScrollView from '../components/AEScrollView';

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
        }}
      />
    </View>
  );
};

const SettingsScreen: React.FC<{}> = () => {
  const {t} = useTranslation('settings');
  const formikRef = useRef<FormikProps<NotificationSettings> | undefined>();
  const {data: settings} = useGetNotificationSettings();
  const [setSettings] = useSetNotificationSettings();
  const {data: profile} = useGetParentProfile();
  const [setProfile] = useSetParentProfile();
  const navigation = useNavigation();
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    if (settings) {
      formikRef.current?.setValues(settings);
    }
  }, [settings]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.iceCold,
      },
    });
  }, [navigation]);

  const notificationPreferences = Array.from<SettingName>([
    'milestoneNotifications',
    'appointmentNotifications',
    'recommendationNotifications',
    'tipsAndActivitiesNotification',
  ]);

  return (
    <AEScrollView>
      <View style={{backgroundColor: colors.white, flex: 1}}>
        <NotificationsBadge />
        <View
          style={{
            width: '100%',
            backgroundColor: 'transparent',
          }}>
          <View style={{height: 16, backgroundColor: colors.iceCold}} />
          <ShortHeaderArc width={'100%'} />
        </View>
        <View style={{flexGrow: 1}}>
          <Text
            style={{
              marginHorizontal: 32,
              marginTop: 36,
              fontSize: 22,
              textTransform: 'capitalize',
              fontFamily: 'Montserrat-Bold',
            }}>
            {t('notificationSettings')}
          </Text>
          <Formik
            initialValues={{
              milestoneNotifications: true,
              appointmentNotifications: true,
              recommendationNotifications: true,
              tipsAndActivitiesNotification: true,
            }}
            validate={(values) => {
              setSettings(values);
            }}
            onSubmit={() => {
              return;
            }}>
            {(formik) => {
              formikRef.current = formik;
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
              style={{
                fontSize: 22,
                fontFamily: 'Montserrat-Bold',
                textTransform: 'capitalize',
              }}>
              {t('userProfile')}
            </Text>
            <Text style={{fontSize: 15, marginVertical: 26}}>{'{State-privacy language}'}</Text>
            <ParentProfileSelector value={profile} onChange={(values) => setProfile(values)} />
            <Text style={{textAlign: 'right', marginTop: 10}}>*required for state</Text>
            <Text
              style={{
                fontSize: 22,
                marginBottom: 16,
                textTransform: 'capitalize',
                fontFamily: 'Montserrat-Bold',
              }}>
              {t('common:appLanguage')}
            </Text>
            <LanguageSelector style={{marginBottom: 40}} />
          </View>
        </View>
      </View>
    </AEScrollView>
  );
};

export default SettingsScreen;
