import React from 'react';
import Text from '../components/Text';
import {useTranslation} from 'react-i18next';
import Layout from '../components/Layout';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {DashboardDrawerNavigationProp, DashboardStackParamList} from '../components/Navigator/types';
import {Button} from 'react-native-paper';
import {View} from 'react-native';
import {useGetAppointmentById} from '../hooks/appointmentsHooks';
import {formatDate} from '../utils/helpers';

type AppointmentScreenRouteProp = RouteProp<DashboardStackParamList, 'Appointment'>;

const AppointmentScreen: React.FC<{}> = () => {
  const {t} = useTranslation();
  const route = useRoute<AppointmentScreenRouteProp>();
  const navigation = useNavigation<DashboardDrawerNavigationProp>();
  const {data: appointment} = useGetAppointmentById(route.params.appointmentId);
  return (
    <Layout>
      <ChildSelectorModal />
      <Text style={{textAlign: 'center', fontSize: 20, marginTop: 20}}>{t('appointment:title')}</Text>
      <Text>
        {t('fields:apptTypePlaceholder')}
        {'\n'} {appointment?.apptType}
      </Text>
      <Text>
        {t('fields:datePlaceholder')}
        {': '}
        {formatDate(appointment?.date, 'date')}
      </Text>
      <Text>
        {t('fields:timePlaceholder')}
        {': '}
        {formatDate(appointment?.date, 'time')}
      </Text>
      <Text>
        {t('fields:doctorPlaceholder')}
        {': '}
        {appointment?.doctorName}
      </Text>
      <View style={{alignItems: 'center', marginVertical: 30}}>
        <Button
          onPress={() => {
            navigation.navigate('AddAppointment', {
              appointmentId: route.params?.appointmentId,
            });
          }}
          style={{width: 300}}
          mode={'outlined'}>
          Show child's summary
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('AddAppointment', {
              appointmentId: route.params?.appointmentId,
            });
          }}
          style={{width: 300}}
          mode={'outlined'}>
          Email child's summary
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('AddAppointment', {
              appointmentId: route.params?.appointmentId,
            });
          }}
          style={{width: 200}}
          mode={'contained'}>
          {t('common:edit')}
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('AddAppointment', {
              appointmentId: route.params?.appointmentId,
            });
          }}
          style={{width: 200}}
          mode={'text'}>
          {t('common:delete')}
        </Button>
      </View>
    </Layout>
  );
};

export default AppointmentScreen;
