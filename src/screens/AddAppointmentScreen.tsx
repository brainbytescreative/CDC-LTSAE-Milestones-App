import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {add, differenceInSeconds, startOfDay} from 'date-fns';
import {useFormik} from 'formik';
import _ from 'lodash';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ScrollView, View} from 'react-native';
import {Text} from 'react-native-paper';

import AEKeyboardAvoidingView from '../components/AEKeyboardAvoidingView';
import AETextInput from '../components/AETextInput';
import ChildSelectorModal from '../components/ChildSelectorModal';
import DatePicker from '../components/DatePicker';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {DashboardDrawerNavigationProp, DashboardStackParamList} from '../components/Navigator/types';
import NavBarBackground from '../components/Svg/NavBarBackground';
import PurpleArc from '../components/Svg/PurpleArc';
import {useAddAppointment, useGetAppointmentById, useUpdateAppointment} from '../hooks/appointmentsHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {colors} from '../resources/constants';
import {addAppointmentSchema} from '../resources/validationSchemas';
import {trackInteractionByType} from '../utils/analytics';

interface FormValues {
  apptType: string;
  date: Date | undefined;
  time: Date | undefined;
  doctorName?: string | undefined;
  notes?: string;
  questions?: string;
}

type AddAppointmentScreenRouteProp = RouteProp<DashboardStackParamList, 'AddAppointment'>;

const AddAppointmentScreen: React.FC = () => {
  const [addAppointment, {status: addStatus}] = useAddAppointment();
  const [updateAppointment, {status: updateStatus}] = useUpdateAppointment();
  const {data: child} = useGetCurrentChild();
  const navigation = useNavigation<DashboardDrawerNavigationProp>();
  const route = useRoute<AddAppointmentScreenRouteProp>();
  const apptId = route.params?.appointmentId;
  const {data: appointment} = useGetAppointmentById(apptId);

  const formik = useFormik<FormValues>({
    validationSchema: addAppointmentSchema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: (values) => {
      if (!values.date || !values.time) {
        throw new Error('Wrong date');
      }

      trackInteractionByType('Completed Add Appointment');

      const dayStart = startOfDay(values.date);
      const seconds = differenceInSeconds(values.time, dayStart);
      const dateTime = add(dayStart, {seconds});

      let action;
      if (apptId) {
        action = updateAppointment({
          ..._.pick(values, ['apptType', 'notes', 'doctorName', 'questions']),
          childId: child?.id || 0,
          date: dateTime || new Date(),
          id: apptId,
        });
      } else {
        action = addAppointment({
          childId: child?.id || 0,
          doctorName: values.doctorName,
          notes: values.notes,
          questions: values.questions,
          date: dateTime,
          apptType: values.apptType,
        });
      }

      action.then((id) => {
        navigation.replace('Appointment', {appointmentId: apptId || id});
      });
    },
    initialValues: {
      apptType: '',
      date: undefined,
      time: undefined,
      doctorName: '',
      notes: '',
      questions: '',
    },
  });

  const setValues = formik.setValues;

  useEffect(() => {
    if (appointment) {
      setValues({
        ...appointment,
        time: appointment.date,
      });
    }
  }, [appointment, setValues]);

  const {t} = useTranslation('addAppointment');
  const titlePrefix = apptId ? 'edit-' : '';
  const disabled = addStatus === 'loading' || updateStatus === 'loading' || !formik.isValid;
  return (
    <ScrollView bounces={false} contentContainerStyle={{flexGrow: 1, backgroundColor: colors.white}} style={{flex: 1}}>
      <View
        style={{
          position: 'absolute',
          width: '100%',
        }}>
        <View style={{backgroundColor: colors.iceCold, height: 40}} />
        <NavBarBackground width={'100%'} />
      </View>
      <View style={{flexGrow: 1, justifyContent: 'space-between'}}>
        <AEKeyboardAvoidingView>
          <View style={{paddingHorizontal: 32}}>
            <ChildSelectorModal />
            <Text
              style={{
                fontSize: 22,
                textAlign: 'center',
                marginTop: 16,
                marginBottom: 5,
                fontFamily: 'Montserrat-Bold',
              }}>
              {t(`${titlePrefix}title`)}
            </Text>
            <AETextInput
              style={{marginTop: 11}}
              autoCorrect={false}
              value={formik.values.apptType}
              onChangeText={formik.handleChange('apptType') as any}
              placeholder={`${t('fields:apptTypePlaceholder')} *`}
            />
            <DatePicker
              style={{marginTop: 11}}
              value={formik.values.date}
              label={`${t('fields:datePlaceholder')} *`}
              onChange={(date) => formik.setFieldValue('date', date)}
            />
            <DatePicker
              mode={'time'}
              style={{marginTop: 11}}
              value={formik.values.time}
              label={`${t('fields:timePlaceholder')} *`}
              onChange={(date) => formik.setFieldValue('time', date)}
            />
            <AETextInput
              autoCorrect={false}
              style={{marginTop: 11}}
              value={formik.values.doctorName}
              onChangeText={formik.handleChange('doctorName') as any}
              placeholder={t('fields:doctorPlaceholder')}
            />
            <AETextInput
              multiline={true}
              autoCorrect={false}
              style={{marginTop: 11}}
              value={formik.values.notes}
              onChangeText={formik.handleChange('notes') as any}
              placeholder={t('fields:notesConcernsPlaceholder')}
            />
            <AETextInput
              multiline={true}
              autoCorrect={false}
              style={{maxHeight: 100, marginTop: 11}}
              value={formik.values.questions}
              onChangeText={formik.handleChange('questions') as any}
              placeholder={t('fields:questionsPlaceholder')}
            />
          </View>
        </AEKeyboardAvoidingView>
        <View style={{marginTop: 47}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingTop: 26, paddingBottom: 32}}>
            <AEButtonRounded disabled={disabled} onPress={formik.handleSubmit} style={{marginBottom: 0}}>
              {apptId ? t('common:done') : t('title')}
            </AEButtonRounded>
            <AEButtonRounded
              onPress={() => {
                trackInteractionByType('Cancel');
                navigation.goBack();
              }}
              style={{marginTop: 10, marginBottom: 30}}>
              {t('common:cancel')}
            </AEButtonRounded>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddAppointmentScreen;
