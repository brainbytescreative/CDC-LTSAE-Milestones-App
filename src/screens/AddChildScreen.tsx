import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import Layout from '../components/Layout';
import {routeKeys} from '../resources/constants';
import {Button, RadioButton, Text, TextInput} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import ImagePicker from 'react-native-image-picker';
import DatePicker from '../components/DatePicker';
import {useAddChild} from '../hooks/db';
import {addEditChildSchema} from '../resources/validationSchemas';
import {DashboardStackParamList} from '../components/Navigator/DashboardStack';

const options = {
  quality: 1.0,
  maxWidth: 500,
  maxHeight: 500,
  storageOptions: {
    skipBackup: true,
  },
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;

const AddChildScreen: React.FC<{}> = () => {
  const navigation = useNavigation();
  const {t} = useTranslation('addChild');

  const [addChild, {status}] = useAddChild();
  const route = useRoute<AddChildRouteProp>();

  let childId = route?.params?.childId;

  const formik = useFormik({
    initialValues: {
      name: '',
      gender: undefined,
      birthday: undefined,
      photo: undefined,
    },
    validationSchema: addEditChildSchema,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => {
      console.warn(values);
      addChild({
        ...values,
        birthday: values.birthday || new Date(),
        gender: values.gender || 0,
      }).then(() => navigation.navigate(routeKeys.Dashboard));
    },
  });

  return (
    <Layout>
      <View style={{padding: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 20}}>{t('title')}</Text>
        <View style={{alignItems: 'center', marginVertical: 30}}>
          <TouchableOpacity
            onPress={() => {
              ImagePicker.showImagePicker(options, (response) => {
                if (response.uri) {
                  formik.setFieldValue('photo', response.uri);
                }
                // console.log(response.uri);
              });
            }}
            style={{
              borderWidth: 1,
              width: 150,
              height: 150,
              borderRadius: 150,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            {formik.values.photo ? (
              <Image
                style={{height: '100%', width: '100%'}}
                source={{
                  uri: formik.values.photo,
                }}
              />
            ) : (
              <Text style={{fontSize: 20}}>{'+'}</Text>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          autoCorrect={false}
          value={formik.values.name}
          onChangeText={formik.handleChange('name') as any}
          label={t('fields:childNamePlaceholder')}
          mode={'outlined'}
        />

        <DatePicker
          label={t('fields:dateOfBirthPlaceholder')}
          onChange={(date) => formik.setFieldValue('birthday', date)}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
          }}>
          <RadioButton.Android
            value="boy"
            status={formik.values.gender === 0 ? 'checked' : 'unchecked'}
            onPress={() => {
              formik.setFieldValue('gender', 0);
            }}
          />
          <Text>{t('boy')}</Text>
          <RadioButton.Android
            value="girl"
            status={formik.values.gender === 1 ? 'checked' : 'unchecked'}
            onPress={() => {
              formik.setFieldValue('gender', 1);
            }}
          />
          <Text>
            {t('girl')} {'*'}
          </Text>
        </View>

        <Button
          disabled={status === 'loading' || !formik.isValid}
          mode={'contained'}
          onPress={() => {
            navigation.navigate(routeKeys.Dashboard);
          }}>
          {t('addAnotherChild').toUpperCase()}
        </Button>
        <Button
          mode={'contained'}
          disabled={status === 'loading' || !formik.isValid}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            formik.handleSubmit();
          }}>
          {t('common:done').toUpperCase()}
        </Button>
        <Text style={{textAlign: 'center'}}>{t('note')}</Text>
      </View>
    </Layout>
  );
};

export default AddChildScreen;
