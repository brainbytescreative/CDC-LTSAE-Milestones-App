import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import Layout from '../components/Layout';
import {routeKeys} from '../resources/constants';
import {Button, RadioButton, Text, TextInput} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import ImagePicker from 'react-native-image-picker';
import DatePicker from '../components/DatePicker';
import {
  useAddChild,
  useGetChild,
  useUpdateChild,
} from '../hooks/childrenDbHooks';
import {addEditChildSchema} from '../resources/validationSchemas';
import {DashboardStackParamList} from '../components/Navigator/DashboardStack';
import {StackNavigationProp} from '@react-navigation/stack';

const options = {
  quality: 1.0,
  maxWidth: 500,
  maxHeight: 500,
  storageOptions: {
    skipBackup: true,
  },
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;
type ProfileScreenNavigationProp = StackNavigationProp<
  DashboardStackParamList,
  'AddChild'
>;

const AddChildScreen: React.FC<{}> = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const {t} = useTranslation('addChild');

  const [addChild, {status: addStatus}] = useAddChild();
  const route = useRoute<AddChildRouteProp>();
  const [childId, setChildId] = useState(route?.params?.childId);
  const prefix = childId ? 'edit-' : '';
  const {data: child} = useGetChild({id: childId});
  const [updateChild, {status: updateStatus}] = useUpdateChild();
  const title = t(`${prefix}title`);

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
      const childInput = {
        ...values,
        birthday: values.birthday || new Date(),
        gender: values.gender || 0,
      };

      if (childId) {
        updateChild({...childInput, id: `${childId}`});
      } else {
        addChild(childInput);
      }
    },
  });

  const isLoading = updateStatus === 'loading' || addStatus === 'loading';

  console.log('formik.values', formik.values);

  useEffect(() => {
    if (updateStatus === 'success' && childId) {
      setChildId(undefined);
      formik.resetForm();
    }
  }, [updateStatus, formik, childId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [title, navigation]);

  useEffect(() => {
    if (child) {
      formik.setValues(child as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child]);

  return (
    <Layout>
      <View style={{padding: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 20}}>
          {t(`${prefix}title`)}
        </Text>
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
          value={formik.values.birthday}
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
          disabled={isLoading || !formik.isValid}
          mode={'contained'}
          onPress={() => {
            formik.handleSubmit();
          }}>
          {t('addAnotherChild').toUpperCase()}
        </Button>
        <Button
          mode={'contained'}
          disabled={isLoading || !formik.isValid}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            formik.handleSubmit();
            navigation.navigate('Dashboard');
          }}>
          {t('common:done').toUpperCase()}
        </Button>
        <Text style={{textAlign: 'center'}}>{t('note')}</Text>
      </View>
    </Layout>
  );
};

export default AddChildScreen;
