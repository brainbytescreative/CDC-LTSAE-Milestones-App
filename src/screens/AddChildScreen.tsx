import React, {useEffect, useLayoutEffect} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import Layout from '../components/Layout';
import {Button, RadioButton, Text, TextInput} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import ImagePicker from 'react-native-image-picker';
import DatePicker from '../components/DatePicker';
import {useAddChild, useGetChild, useUpdateChild} from '../hooks/childrenHooks';
import {addEditChildSchema} from '../resources/validationSchemas';

import {StackNavigationProp} from '@react-navigation/stack';
import {DashboardStackParamList} from '../components/Navigator/types';
import {useSetOnboarding} from '../hooks/onboardingHooks';

const options = {
  quality: 1.0,
  maxWidth: 500,
  maxHeight: 500,
  storageOptions: {
    skipBackup: true,
  },
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;
type AddChildScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'AddChild'>;

const AddChildScreen: React.FC<{}> = () => {
  const navigation = useNavigation<AddChildScreenNavigationProp>();
  const {t} = useTranslation('addChild');

  const [addChild, {status: addStatus}] = useAddChild();
  const route = useRoute<AddChildRouteProp>();
  const childId = route?.params?.childId;
  const prefix = childId ? 'edit-' : '';
  const {data: child} = useGetChild({id: childId});
  const [updateChild, {status: updateStatus}] = useUpdateChild();
  const title = t(`${prefix}title`);
  const [setOnboarding] = useSetOnboarding();

  const initialValues = {
    name: '',
    gender: undefined,
    birthday: undefined,
    photo: undefined,
    ...route.params?.child,
  };

  const formik = useFormik({
    initialValues: initialValues,
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
        return updateChild({...childInput, id: childId});
      } else {
        return addChild({data: childInput, isAnotherChild: !!route.params?.anotherChild});
      }
    },
  });

  const isLoading = updateStatus === 'loading' || addStatus === 'loading';

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [title, navigation, route.params]);

  useEffect(() => {
    if (child) {
      formik.setValues(child as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child]);

  return (
    <Layout>
      <View style={{padding: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 20}}>{t(`${prefix}title`)}</Text>
        <View style={{alignItems: 'center', marginVertical: 30}}>
          <TouchableOpacity
            onPress={() => {
              ImagePicker.showImagePicker(options, (response) => {
                if (response.uri) {
                  formik.setFieldValue('photo', response.uri);
                }
                console.log(response.uri);
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
            navigation.replace('AddChild', {
              childId: undefined,
              anotherChild: true,
              onboarding: !!route.params?.onboarding,
              child: {
                name: formik.values.name,
                photo: formik.values.photo,
                gender: formik.values.gender || 0,
                birthday: formik.values.birthday || new Date(),
              },
            });
          }}>
          {t('addAnotherChild').toUpperCase()}
        </Button>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            mode={'contained'}
            disabled={isLoading || !formik.isValid}
            style={{marginVertical: 50, width: 100}}
            onPress={() => {
              formik.handleSubmit();
              if (route.params?.onboarding) {
                navigation.navigate('Dashboard');
                setOnboarding(true);
              } else {
                // navigation.navigate('Dashboard');
                navigation.goBack();
              }
            }}>
            {t('common:done').toUpperCase()}
          </Button>
          {route.params?.anotherChild && route.params?.onboarding && (
            <Button
              mode={'contained'}
              style={{marginVertical: 50, width: 100}}
              onPress={() => {
                navigation.navigate('Dashboard');
              }}>
              {t('common:skip').toUpperCase()}
            </Button>
          )}
        </View>
        <Text style={{textAlign: 'center'}}>{t('note')}</Text>
      </View>
    </Layout>
  );
};

export default AddChildScreen;
