import React, {useEffect, useLayoutEffect} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {RadioButton, Text, Title} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import ImagePicker from 'react-native-image-picker';
import DatePicker from '../components/DatePicker';
import {useAddChild, useGetChild, useUpdateChild} from '../hooks/childrenHooks';
import {addEditChildSchema} from '../resources/validationSchemas';

import {StackNavigationProp} from '@react-navigation/stack';
import {DashboardStackParamList, RootStackParamList} from '../components/Navigator/types';
import {useSetOnboarding} from '../hooks/onboardingHooks';
import {colors, missingConcerns, sharedStyle} from '../resources/constants';
import {useSetConcern} from '../hooks/checklistHooks';
import CancelDoneTopControl from '../components/CancelDoneTopControl';
import AETextInput from '../components/AETextInput';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {PlusIcon, PurpleArc} from '../resources/svg';
import {useSafeArea} from 'react-native-safe-area-context';
import AEScrollView from '../components/AEScrollView';
import NavBarBackground from '../resources/svg/NavBarBackground';

const options = {
  quality: 1.0,
  maxWidth: 500,
  maxHeight: 500,
  storageOptions: {
    skipBackup: true,
  },
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;
type AddChildScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'AddChild'> &
  StackNavigationProp<RootStackParamList, 'AddChild'>;

const NextScreen: keyof RootStackParamList = 'OnboardingHowToUse';

const AddChildScreen: React.FC<{}> = () => {
  const navigation = useNavigation<AddChildScreenNavigationProp>();
  const {top, bottom} = useSafeArea();
  const {t} = useTranslation('addChild');

  const [setConcern] = useSetConcern();

  const [addChild, {status: addStatus}] = useAddChild({
    onSuccess: (data) => {
      data && Promise.all(missingConcerns.map((concernId) => setConcern({concernId, childId: data, answer: true})));
    },
  });

  const route = useRoute<AddChildRouteProp>();
  const childId = route?.params?.childId;
  const prefix = childId ? 'edit-' : '';
  const {data: child} = useGetChild({id: childId});
  const [updateChild, {status: updateStatus}] = useUpdateChild();
  const title = t(`${prefix}title`);

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

  const onDone = () => {
    formik.handleSubmit();
    if (route.params?.onboarding) {
      navigation.navigate('OnboardingHowToUse');
      // setOnboarding(true);
    } else {
      // navigation.navigate('Dashboard');
      navigation.goBack();
    }
  };
  const onCancel = () => {
    if (route.params?.onboarding) {
      navigation.navigate(NextScreen);
    } else {
      navigation.goBack();
    }
  };
  return (
    <AEScrollView>
      <View style={{backgroundColor: colors.iceCold, paddingTop: top, flex: 1}}>
        <View style={{backgroundColor: colors.white, flexGrow: 1, justifyContent: 'space-between'}}>
          <View style={{top: 0, position: 'absolute', width: '100%', height: '80%'}}>
            <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
            <NavBarBackground width={'100%'} />
          </View>
          <CancelDoneTopControl onCancel={onCancel} onDone={onDone} />

          <Title adjustsFontSizeToFit style={{fontSize: 22, marginHorizontal: 32, textAlign: 'center'}}>
            {t(`${prefix}title`)}
          </Title>
          <View style={{alignItems: 'center', marginTop: 30, marginBottom: 20}}>
            <View style={[sharedStyle.shadow]}>
              <TouchableOpacity
                onPress={() => {
                  ImagePicker.showImagePicker(options, (response) => {
                    if (response.uri) {
                      formik.setFieldValue('photo', response.uri);
                    }
                    console.log(response.uri);
                  });
                }}
                style={[
                  {
                    width: 190,
                    height: 190,
                    borderRadius: 150,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: colors.purple,
                  },
                  sharedStyle.shadow,
                ]}>
                {formik.values.photo ? (
                  <Image
                    style={{height: '100%', width: '100%'}}
                    source={{
                      uri: formik.values.photo,
                    }}
                  />
                ) : (
                  <PlusIcon />
                )}
              </TouchableOpacity>
            </View>
            <Text style={{marginTop: 10, fontSize: 15}}>{t('addPhoto')}</Text>
          </View>
        </View>
        <View style={{backgroundColor: colors.white, flexGrow: 1, paddingHorizontal: 32}}>
          <AETextInput
            autoCorrect={false}
            value={formik.values.name}
            onChangeText={formik.handleChange('name') as any}
            placeholder={t('fields:childNamePlaceholder')}
          />
          <View style={{height: 11}} />
          <DatePicker
            value={formik.values.birthday}
            label={t('fields:dateOfBirthPlaceholder')}
            onChange={(date) => formik.setFieldValue('birthday', date)}
          />
          <View
            style={[
              {
                padding: 5,
                backgroundColor: colors.yellow,
                borderRadius: 10,
                marginTop: 20,
                paddingHorizontal: 15,
              },
              sharedStyle.shadow,
            ]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontSize: 15,
                textAlign: 'center',
              }}>
              {t('prematureQuestion')}
            </Text>
          </View>
          <View style={{marginTop: 20, marginBottom: 16}}>
            <Text style={{marginLeft: 8}}>{t('selectOne')}</Text>
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
            <Text style={{textAlign: 'right'}}>{t('common:required')}</Text>
          </View>
        </View>

        <View style={{backgroundColor: colors.white, flexGrow: 2, justifyContent: 'space-between'}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, flexGrow: 2, paddingBottom: bottom ? bottom : 16}}>
            <View style={{marginTop: 50}}>
              <AEButtonRounded
                disabled={isLoading || !formik.isValid}
                style={{marginVertical: 0}}
                onPress={() => {
                  formik.handleSubmit();
                  navigation.replace('AddChild', {
                    childId: undefined,
                    anotherChild: true,
                    onboarding: !!route.params?.onboarding,
                    child: {
                      name: formik.values.name,
                      gender: formik.values.gender || 0,
                      birthday: formik.values.birthday || new Date(),
                    },
                  });
                }}>
                {t('addAnotherChild').toUpperCase()}
              </AEButtonRounded>
              <AEButtonRounded disabled={isLoading || !formik.isValid} style={{marginBottom: 24}} onPress={onDone}>
                {t('common:done').toUpperCase()}
              </AEButtonRounded>
            </View>
            <View
              style={[
                {backgroundColor: colors.yellow, marginHorizontal: 32, padding: 16, borderRadius: 10},
                sharedStyle.shadow,
              ]}>
              <Text style={{textAlign: 'center'}}>{t('note')}</Text>
              <Text style={{textAlign: 'center', marginTop: 15, textDecorationLine: 'underline'}}>
                {t('noteClick')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AEScrollView>
  );
};

export default AddChildScreen;
