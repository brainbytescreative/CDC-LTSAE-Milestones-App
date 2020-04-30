import React, {useEffect, useRef} from 'react';
import Layout from '../components/Layout';
import ParentProfileSelector from '../components/ParentProfileSelector';
import {useTranslation} from 'react-i18next';
import {Switch, Text} from 'react-native-paper';
import {View} from 'react-native';
import {Formik, useField} from 'formik';
import LanguageSelector from '../components/LanguageSelector';
import {
  NotificationSettings,
  SettingName,
  useGetNotificationSettings,
  useSetNotificationSettings,
} from '../hooks/settingsHooks';
import {FormikProps} from 'formik/dist/types';
import {useGetParentProfile, useSetParentProfile} from '../hooks/parentProfileHooks';
import NotificationsBadge from '../components/NotificationsBadge';

const NotificationSetting: React.FC<{name: SettingName}> = ({name}) => {
  const {t} = useTranslation('fields');

  const [field, , helpers] = useField<boolean>(name);

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
      <NotificationsBadge />
      <Text>{t(name)}</Text>
      <Switch
        value={field.value}
        onValueChange={() => {
          helpers.setValue(!field.value);
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

  useEffect(() => {
    if (settings) {
      formikRef.current?.setValues(settings);
    }
  }, [settings]);

  return (
    <Layout>
      <Text style={{marginHorizontal: 10, marginTop: 10, fontSize: 20}}>{t('notificationSettings').toUpperCase()}</Text>
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
            <View style={{margin: 10}}>
              <NotificationSetting name={'milestoneNotifications'} />
              <NotificationSetting name={'appointmentNotifications'} />
              <NotificationSetting name={'recommendationNotifications'} />
              <NotificationSetting name={'tipsAndActivitiesNotification'} />
            </View>
          );
        }}
      </Formik>
      <Text style={{margin: 10, fontSize: 20}}>{t('accountSettings').toUpperCase()}</Text>
      <ParentProfileSelector value={profile} onChange={(values) => setProfile(values)} />
      <LanguageSelector />
    </Layout>
  );
};

export default SettingsScreen;
