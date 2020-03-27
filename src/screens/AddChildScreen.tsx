import React from 'react';
import {View} from 'react-native';
import Layout from '../components/Layout';
import {routeKeys} from '../resources/constants';
import {Button, RadioButton, TextInput, Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';

const AddChildScreen: React.FC<{}> = () => {
  const navigation = useNavigation();
  const {t} = useTranslation('addChild');
  const formik = useFormik({
    initialValues: {
      name: '',
      gender: null,
    },
    onSubmit: (values) => {
      console.warn(values);
    },
  });
  return (
    <Layout>
      <View style={{padding: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 20}}>{t('title')}</Text>

        <TextInput
          autoCorrect={false}
          onChange={formik.handleChange('name') as any}
          label={t('fields:childNamePlaceholder')}
          mode={'outlined'}
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
          mode={'contained'}
          onPress={() => {
            navigation.navigate(routeKeys.Dashboard);
          }}>
          {t('addAnotherChild').toUpperCase()}
        </Button>
        <Button
          mode={'contained'}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            formik.handleSubmit();
            // navigation.navigate(routeKeys.Dashboard);
          }}>
          {t('common:Done').toUpperCase()}
        </Button>
        <Text style={{textAlign: 'center'}}>{t('note')}</Text>
      </View>
    </Layout>
  );
};

export default AddChildScreen;
