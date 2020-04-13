import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Button, TextInput} from 'react-native-paper';
import {useFormik} from 'formik';
import {useTranslation} from 'react-i18next';
import Layout from '../components/Layout';
import Text from '../components/Text';
import DatePicker from '../components/DatePicker';
import {useAddAppointment, useGetAppointmentById, useUpdateAppointment} from '../hooks/appointmentsHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {format, parse} from 'date-fns';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {DashboardDrawerNavigationProp, DashboardStackParamList} from '../components/Navigator/types';
import _ from 'lodash';
import {addAppointmentSchema} from '../resources/validationSchemas';

interface FormValues {
  apptType: string;
  date: Date | undefined;
  time: Date | undefined;
  doctorName?: string | undefined;
  notes?: string;
  questions?: string;
}

type AddAppointmentScreenRouteProp = RouteProp<DashboardStackParamList, 'AddAppointment'>;

const AddAppointmentScreen: React.FC<{}> = () => {
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
      const date = values.date && format(values.date, 'yyyy-MM-dd');
      const time = values.time && format(values.time, 'HH:mm:ss');
      const dateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm:ss', new Date());

      const action = apptId
        ? updateAppointment({
            ..._.pick(values, ['apptType', 'notes', 'doctorName', 'questions']),
            childId: child?.id || '-1',
            date: values.date || new Date(),
            id: `${apptId}`,
          })
        : addAppointment({
            childId: child?.id || '-1',
            doctorName: values.doctorName,
            notes: values.notes,
            questions: values.questions,
            date: dateTime,
            apptType: values.apptType,
          });

      action.then(() => {
        if (apptId) {
          navigation.goBack();
        } else {
          navigation.navigate('Dashboard');
        }
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

  const setValues = useCallback(formik.setValues, []);

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
    <Layout>
      <View style={{padding: 20}}>
        <ChildSelectorModal />
        <Text style={{fontSize: 22, textAlign: 'center', marginBottom: 20}}>{t(`${titlePrefix}title`)}</Text>
        <TextInput
          autoCorrect={false}
          value={formik.values.apptType}
          onChangeText={formik.handleChange('apptType') as any}
          label={`${t('fields:apptTypePlaceholder')} *`}
          mode={'outlined'}
        />
        <DatePicker
          style={{marginTop: 10}}
          value={formik.values.date}
          label={`${t('fields:datePlaceholder')} *`}
          onChange={(date) => formik.setFieldValue('date', date)}
        />
        <DatePicker
          mode={'time'}
          style={{marginTop: 10}}
          value={formik.values.time}
          label={`${t('fields:timePlaceholder')} *`}
          onChange={(date) => formik.setFieldValue('time', date)}
        />
        <TextInput
          autoCorrect={false}
          style={{maxHeight: 100, marginTop: 10}}
          value={formik.values.doctorName}
          onChangeText={formik.handleChange('doctorName') as any}
          label={t('fields:doctorPlaceholder')}
          mode={'outlined'}
        />
        <TextInput
          multiline={true}
          autoCorrect={false}
          numberOfLines={3}
          style={{maxHeight: 100, marginTop: 10}}
          value={formik.values.notes}
          onChangeText={formik.handleChange('notes') as any}
          label={t('fields:notesConcernsPlaceholder')}
          mode={'outlined'}
        />
        <TextInput
          multiline={true}
          autoCorrect={false}
          numberOfLines={3}
          style={{maxHeight: 100, marginTop: 10}}
          value={formik.values.questions}
          onChangeText={formik.handleChange('questions') as any}
          label={t('fields:questionsPlaceholder')}
          mode={'outlined'}
        />
      </View>
      <View style={{alignItems: 'center', marginVertical: 30}}>
        <Button onPress={formik.handleSubmit} disabled={disabled} style={{width: 200}} mode={'contained'}>
          {t('common:done')}
        </Button>
      </View>
    </Layout>
  );
};

export default AddAppointmentScreen;
