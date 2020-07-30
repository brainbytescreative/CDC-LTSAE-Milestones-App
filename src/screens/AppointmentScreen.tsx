import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import AEButtonRounded from '../components/AEButtonRounded';
import AEScrollView from '../components/AEScrollView';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {DashboardDrawerNavigationProp, DashboardStackParamList} from '../components/Navigator/types';
import PurpleArc from '../components/Svg/PurpleArc';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import {useDeleteAppointment, useGetAppointmentById} from '../hooks/appointmentsHooks';
import {useGetComposeSummaryMail} from '../hooks/checklistHooks';
import {colors} from '../resources/constants';
import {trackInteractionByType, trackSelectByType} from '../utils/analytics';
import {formatDate} from '../utils/helpers';

type AppointmentScreenRouteProp = RouteProp<DashboardStackParamList, 'Appointment'>;

const AppointmentScreen: React.FC = () => {
  const {t} = useTranslation('appointment');
  const route = useRoute<AppointmentScreenRouteProp>();
  const navigation = useNavigation<DashboardDrawerNavigationProp>();
  const {data: appointment, status: loadStatus} = useGetAppointmentById(route.params.appointmentId);
  const [deleteAppointment, {status: deleteStatus}] = useDeleteAppointment();

  const childData = {
    id: appointment?.childId,
    name: appointment?.childName,
    gender: appointment?.childGender,
  };
  const {compose: composeMail, loading: composeLoading} = useGetComposeSummaryMail(childData);

  const loading = loadStatus === 'loading' || deleteStatus === 'loading' || composeLoading;

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
        <ChildSelectorModal />
        <View style={{flexGrow: 1, marginHorizontal: 32}}>
          <Text
            style={[
              {
                textAlign: 'center',
                fontSize: 22,
                marginBottom: 22,
                marginTop: 28,
                fontFamily: 'Montserrat-Bold',
              },
            ]}>
            {appointment?.apptType}
          </Text>
          <Text style={[styles.item]}>{appointment?.childName}</Text>
          <Text style={[styles.item]}>{formatDate(appointment?.date, 'date')}</Text>
          <Text style={[styles.item]}>{formatDate(appointment?.date, 'time')}</Text>
          {!!appointment?.doctorName && <Text style={[styles.item]}>{appointment?.doctorName}</Text>}
          {(!!appointment?.questions || !!appointment?.notes) && (
            <>
              <Text
                style={{
                  fontFamily: 'Montserrat-Bold',
                  fontSize: 15,
                  marginTop: 27,
                  marginBottom: 23,
                }}>
                {t('concernsOrNotesForDoctor')}
              </Text>
              {!!appointment?.notes && <Text style={[styles.item]}>{appointment?.notes}</Text>}
              {!!appointment?.questions && <Text style={[styles.item]}>{appointment?.questions}</Text>}
            </>
          )}
        </View>
        <View style={{marginTop: 47}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingTop: 26, paddingBottom: 32}}>
            <AEButtonRounded
              onPress={() => {
                trackInteractionByType('Edit Appointment');
                navigation.replace('AddAppointment', {
                  appointmentId: Number(route.params?.appointmentId),
                });
              }}
              style={{marginBottom: 0}}>
              {t('common:edit')}
            </AEButtonRounded>
            <AEButtonRounded
              onPress={() => {
                trackSelectByType('My Child Summary');
                navigation.navigate('ChildSummary');
              }}
              disabled={loading}
              style={{marginTop: 10, marginBottom: 0}}>
              {t('showChildsSummary')}
            </AEButtonRounded>
            <AEButtonRounded
              onPress={() => {
                trackSelectByType("Email Child's Summary");
                composeMail().catch((e) => {
                  Alert.alert('', e.message);
                });
              }}
              disabled={loading}
              style={{marginTop: 10, marginBottom: 30}}>
              {t('emailChildsSummary')}
            </AEButtonRounded>
            <Button
              disabled={loading}
              onPress={() => {
                if (appointment?.id) {
                  trackInteractionByType('Delete Appointment');
                  deleteAppointment(appointment?.id);
                }
                navigation.navigate('Dashboard');
              }}
              labelStyle={{textTransform: 'capitalize', textDecorationLine: 'underline'}}
              mode={'text'}>
              {t('deleteAppointment')}
            </Button>
          </View>
        </View>
      </AEScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    marginBottom: 3,
    fontSize: 15,
  },
});

export default AppointmentScreen;
