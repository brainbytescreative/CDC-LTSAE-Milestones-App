import React from 'react';
import Text from '../components/Text';
import {useTranslation} from 'react-i18next';
import Layout from '../components/Layout';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {DashboardDrawerNavigationProp, DashboardStackParamList} from '../components/Navigator/types';
import {Button} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {useDeleteAppointment, useGetAppointmentById} from '../hooks/appointmentsHooks';
import {formatDate} from '../utils/helpers';

type AppointmentScreenRouteProp = RouteProp<DashboardStackParamList, 'Appointment'>;

const AppointmentScreen: React.FC<{}> = () => {
  const {t} = useTranslation();
  const route = useRoute<AppointmentScreenRouteProp>();
  const navigation = useNavigation<DashboardDrawerNavigationProp>();
  const {data: appointment, status: loadStatus} = useGetAppointmentById(route.params.appointmentId);
  const [deleteAppointment, {status: deleteStatus}] = useDeleteAppointment();

  const loading = loadStatus === 'loading' || deleteStatus === 'loading';
  return (
    <Layout style={{justifyContent: 'space-between', alignItems: 'center'}}>
      <ChildSelectorModal />
      <View style={{alignItems: 'center'}}>
        <Text style={{textAlign: 'center', fontSize: 20, marginVertical: 20, fontWeight: 'bold'}}>
          {t('appointment:title')}
        </Text>
        <View style={styles.item}>
          <Text style={[styles.label]}>
            {t('fields:apptTypePlaceholder')}
            {':'}
          </Text>
          <Text>{appointment?.apptType}</Text>
        </View>
        <Text style={styles.item}>
          <Text style={[styles.label]}>
            {t('fields:datePlaceholder')}
            {': '}
          </Text>
          {formatDate(appointment?.date, 'date')}
        </Text>
        <Text style={styles.item}>
          <Text style={[styles.label]}>
            {t('fields:timePlaceholder')}
            {': '}
          </Text>
          {formatDate(appointment?.date, 'time')}
        </Text>
        <Text style={styles.item}>
          <Text style={[styles.label]}>
            {t('fields:doctorPlaceholder')}
            {': '}
          </Text>
          {appointment?.doctorName}
        </Text>
      </View>
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
      <View>
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
      </View>

      <Button
        disabled={loading}
        onPress={() => {
          appointment?.id && deleteAppointment(appointment?.id);
          navigation.navigate('Dashboard');
        }}
        style={{width: 200}}
        mode={'text'}>
        {t('common:delete')}
      </Button>
    </Layout>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
  },
  item: {
    marginBottom: 10,
    fontSize: 15,
    alignItems: 'center',
  },
});

export default AppointmentScreen;
