import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FastField, FastFieldProps, FieldArray, Formik, FormikProps} from 'formik';
import {TFunction} from 'i18next';
import _ from 'lodash';
import React, {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from 'react-native';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonRounded from '../components/AEButtonRounded';
import AERadioButton from '../components/AERadioButton';
import AEScrollView from '../components/AEScrollView';
import AETextInput from '../components/AETextInput';
import CancelDoneTopControl from '../components/CancelDoneTopControl';
import DatePicker from '../components/DatePicker';
import {DashboardStackParamList, RootStackParamList} from '../components/Navigator/types';
import NavBarBackground from '../components/Svg/NavBarBackground';
import PlusIcon from '../components/Svg/PlusIcon';
import PurpleArc from '../components/Svg/PurpleArc';
import {useAddChild, useGetChild, useUpdateChild} from '../hooks/childrenHooks';
import {colors, sharedStyle} from '../resources/constants';
import {addEditChildSchema} from '../resources/validationSchemas';
import {
  trackAddAnotherChild,
  trackChildAddAPhoto,
  trackChildAddChildName,
  trackChildAge,
  trackChildCompletedAddChildName,
  trackChildCompletedAddPhoto,
  trackChildCompletedChildDateOfBirth,
  trackChildDone,
  trackChildGender,
  trackChildStartedChildDateOfBirth,
  trackCompleteAddChild,
} from '../utils/analytics';

const options: ImagePickerOptions = {
  noData: true,
  quality: 1.0,
  maxWidth: 500,
  maxHeight: 500,
  mediaType: 'photo',
  storageOptions: {
    skipBackup: true,
    privateDirectory: true,
  },
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;
type AddChildScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'AddChild'> &
  StackNavigationProp<RootStackParamList, 'AddChild'>;

const NextScreen: keyof RootStackParamList = 'OnboardingHowToUse';

interface CommonFieldProps {
  t: TFunction;
  name: string;
}

const PhotoField: React.FC<CommonFieldProps> = ({t, name}) => (
  <FastField name={name}>
    {({field, form}: FastFieldProps<string | undefined>) => (
      <View style={{alignItems: 'center', marginTop: 30, marginBottom: 20}}>
        <View style={[sharedStyle.shadow]}>
          <TouchableOpacity
            accessibilityRole={'button'}
            accessibilityLabel={t('accessibility:addChildPhoto')}
            onPress={() => {
              trackChildAddAPhoto();
              ImagePicker.showImagePicker(options, (response) => {
                console.log('response.type', JSON.stringify(response, null, 2));
                if (response.uri) {
                  trackChildCompletedAddPhoto();
                  form.setFieldValue(field.name, response.uri);
                }
                console.log(response.uri);
              });
            }}
            style={[styles.childImage, sharedStyle.shadow]}>
            {field.value ? (
              <Image
                style={{height: '100%', width: '100%'}}
                source={{
                  uri: field.value,
                }}
              />
            ) : (
              <PlusIcon />
            )}
          </TouchableOpacity>
        </View>
        <Text style={{marginTop: 10, fontSize: 15}}>{field.value ? t('changePhoto') : t('addPhoto')}</Text>
      </View>
    )}
  </FastField>
);

const NameField: React.FC<CommonFieldProps> = ({t, name}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<string>) => (
        <AETextInput
          onFocus={() => {
            trackChildAddChildName();
          }}
          onBlur={() => {
            trackChildCompletedAddChildName();
          }}
          style={[Boolean(meta.error) && sharedStyle.errorOutline]}
          autoCorrect={false}
          value={field.value}
          onChangeText={form.handleChange(field.name) as any}
          placeholder={t('fields:childNamePlaceholder')}
        />
      )}
    </FastField>
  );
};

const BirthdayField: React.FC<CommonFieldProps> = ({name, t}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<Date | undefined>) => (
        <>
          <DatePicker
            error={Boolean(meta.error)}
            onPress={() => {
              trackChildStartedChildDateOfBirth();
            }}
            value={field.value}
            label={t('fields:dateOfBirthPlaceholder')}
            onChange={(date) => {
              trackChildCompletedChildDateOfBirth();
              form.setFieldValue(name, date);
            }}
          />
          {Platform.select({
            android: <Text style={{marginTop: 8}}>{t('addChild:dateHint')}</Text>,
          })}
        </>
      )}
    </FastField>
  );
};

const GenderField: React.FC<CommonFieldProps> = ({t, name}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<0 | 1 | undefined>) => (
        <View style={{marginTop: 20, marginBottom: 16}}>
          <Text style={{marginLeft: 8}}>{t('selectOne')}</Text>
          <View
            style={[
              {
                flexDirection: 'row',
                marginVertical: 10,
                justifyContent: 'flex-start',
              },
            ]}>
            <View
              style={[
                {flexDirection: 'row'},
                Boolean(meta.error) && {...sharedStyle.errorOutline, paddingVertical: 1},
              ]}>
              <AERadioButton
                onChange={() => form.setFieldValue(field.name, 0)}
                value={field.value === 0}
                title={t('boy')}
                titleStyle={{marginRight: 32}}
              />
              <AERadioButton
                onChange={() => form.setFieldValue(field.name, 1)}
                value={field.value === 1}
                title={`${t('girl')}`}
                titleStyle={{marginRight: 0}}
              />
            </View>
          </View>
          <Text style={[{textAlign: 'right'}, sharedStyle.required]}>{t('common:required')}</Text>
        </View>
      )}
    </FastField>
  );
};

const PrematureTip: React.FC<{t: TFunction} & Pick<TouchableWithoutFeedbackProps, 'onPress'>> = ({t, onPress}) => (
  <TouchableWithoutFeedback onPress={onPress} accessibilityRole={'button'}>
    <View style={[styles.prematureTip, sharedStyle.shadow]}>
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
  </TouchableWithoutFeedback>
);

const AddChildScreen: React.FC = () => {
  const navigation = useNavigation<AddChildScreenNavigationProp>();
  const {top, bottom} = useSafeAreaInsets();
  const {t} = useTranslation('addChild');

  const [addChild, {status: addStatus}] = useAddChild();

  const route = useRoute<AddChildRouteProp>();
  const childId = route?.params?.childId;
  const prefix = childId ? 'edit-' : '';
  const {data: child} = useGetChild({id: childId});
  const [updateChild, {status: updateStatus}] = useUpdateChild();
  const title = t(`${prefix}title`);

  const formikRef = useRef<FormikProps<typeof initialValues> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const firstChild = {
    name: '',
    gender: undefined,
    birthday: undefined,
    photo: undefined,
    ...route.params?.child,
  };
  const initialValues: {firstChild: typeof firstChild; anotherChildren?: typeof firstChild[]} = {
    firstChild,
    anotherChildren: [],
  };

  const isLoading = updateStatus === 'loading' || addStatus === 'loading';

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [title, navigation, route.params]);

  useEffect(() => {
    child && formikRef.current?.setValues({firstChild: child, anotherChildren: []});
  }, [child]);

  const onDone = () => {
    formikRef.current?.validateForm().then((errors) => {
      if (_.isEmpty(errors)) {
        formikRef.current?.handleSubmit();
        if (route.params?.onboarding) {
          navigation.navigate('OnboardingHowToUse');
          // setOnboarding(true);
        } else {
          // navigation.navigate('Dashboard');
          navigation.goBack();
        }
        trackChildDone();
      } else {
        Alert.alert('', t('alert:enterChildInformation'));
      }
    });
  };
  const onCancel = () => {
    if (route.params?.onboarding) {
      navigation.navigate(NextScreen);
    } else {
      navigation.goBack();
    }
  };

  const onPrematureTipPress = useCallback(() => {
    scrollViewRef.current?.scrollToEnd();
  }, [scrollViewRef]);

  return (
    <AEScrollView innerRef={scrollViewRef}>
      <Formik
        initialValues={initialValues}
        validationSchema={addEditChildSchema}
        innerRef={formikRef}
        validateOnChange
        validateOnMount
        onSubmit={async (values) => {
          const childInput = {
            ...values.firstChild,
            birthday: values.firstChild.birthday!,
            gender: values.firstChild.gender || 0,
          };

          if (childId) {
            updateChild({...childInput, id: childId});
          } else {
            addChild({data: childInput, isAnotherChild: false}).then(() => {
              trackCompleteAddChild();
              trackChildAge(values.firstChild.birthday);
              trackChildGender(Number(values.firstChild.gender));
            });
          }

          const anotherChildren = values.anotherChildren ?? [];
          for (const anotherChild of anotherChildren) {
            const otherInput = {
              ...anotherChild,
              birthday: anotherChild.birthday!,
              gender: anotherChild.gender!,
            };
            await addChild({data: otherInput, isAnotherChild: true})
              .then(() => {
                trackCompleteAddChild();
                trackChildAge(anotherChild.birthday);
                trackChildGender(Number(anotherChild.gender));
              })
              .catch(console.error);
          }
        }}>
        {(formikProps) => (
          <View style={{backgroundColor: colors.iceCold, paddingTop: top, flex: 1}}>
            <View style={{backgroundColor: colors.white, flexGrow: 1, justifyContent: 'space-between'}}>
              <View style={{top: 0, position: 'absolute', width: '100%', height: '80%'}}>
                <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
                <NavBarBackground width={'100%'} />
              </View>
              {(!route.params?.onboarding || !_.isEmpty(formikProps.values.anotherChildren)) && (
                <CancelDoneTopControl
                  disabled={isLoading || !formikProps.isValid}
                  onCancel={route.params?.onboarding ? undefined : onCancel}
                  onDone={onDone}
                />
              )}
              <Text
                adjustsFontSizeToFit
                style={[{marginHorizontal: 32, textAlign: 'center'}, sharedStyle.largeBoldText]}>
                {t(`${prefix}title`)}
              </Text>
              <PhotoField name={'firstChild.photo'} t={t} />
            </View>
            <View style={{backgroundColor: colors.white, flexGrow: 1, paddingHorizontal: 32}}>
              <NameField t={t} name={'firstChild.name'} />
              <View style={{height: 11}} />
              <BirthdayField name={'firstChild.birthday'} t={t} />
              <PrematureTip t={t} onPress={onPrematureTipPress} />
              <GenderField t={t} name={'firstChild.gender'} />
            </View>

            <FieldArray name={'anotherChildren'}>
              {(arrayHelpers) => (
                <>
                  <View style={{backgroundColor: colors.white, paddingHorizontal: 32}}>
                    {formikProps.values.anotherChildren?.map((item, index) => (
                      <View key={`child-${index}`}>
                        <PhotoField name={`anotherChildren.${index}.photo`} t={t} />
                        <NameField t={t} name={`anotherChildren.${index}.name`} />
                        <View style={{height: 11}} />
                        <BirthdayField name={`anotherChildren.${index}.birthday`} t={t} />
                        <PrematureTip t={t} onPress={onPrematureTipPress} />
                        <GenderField t={t} name={`anotherChildren.${index}.gender`} />
                        <AEButtonRounded
                          contentStyle={{backgroundColor: colors.apricot}}
                          onPress={() => {
                            Alert.alert(
                              '',
                              t('dialog:deleteMessage', {subject: ''}),
                              [
                                {
                                  text: t('dialog:no'),
                                  style: 'cancel',
                                },
                                {
                                  text: t('dialog:yes'),
                                  style: 'default',
                                  onPress: () => arrayHelpers.remove(index),
                                },
                              ],
                              {cancelable: false},
                            );
                          }}
                          style={{marginHorizontal: 0}}>
                          {t('common:delete')}
                        </AEButtonRounded>
                      </View>
                    ))}
                  </View>
                  <View style={{backgroundColor: colors.white, flexGrow: 2, justifyContent: 'space-between'}}>
                    <PurpleArc width={'100%'} />
                    <View style={{backgroundColor: colors.purple, flexGrow: 2, paddingBottom: bottom ? bottom : 16}}>
                      <View style={{marginTop: 50}}>
                        <AEButtonRounded
                          disabled={isLoading}
                          style={{marginVertical: 0}}
                          onPress={async () => {
                            await formikProps.validateForm().then((errors) => {
                              if (_.isEmpty(errors)) {
                                trackAddAnotherChild();
                                arrayHelpers.push({
                                  name: '',
                                });
                              } else {
                                Alert.alert('', t('alert:enterChildInformation'));
                              }
                            });
                          }}>
                          {t('addAnotherChild')}
                        </AEButtonRounded>
                        <AEButtonRounded disabled={isLoading} style={{marginBottom: 24}} onPress={onDone}>
                          {t('common:done')}
                        </AEButtonRounded>
                      </View>
                      <View
                        style={[
                          {backgroundColor: colors.yellow, marginHorizontal: 32, padding: 16, borderRadius: 10},
                          sharedStyle.shadow,
                        ]}>
                        <Text style={{textAlign: 'center'}}>{t('note')}</Text>
                        <Text
                          accessibilityRole={'link'}
                          onPress={() => Linking.openURL(t('correctedAgeLink'))}
                          style={{textAlign: 'center', marginTop: 15, textDecorationLine: 'underline'}}>
                          {t('noteClick')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </FieldArray>
          </View>
        )}
      </Formik>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  prematureTip: {
    padding: 5,
    backgroundColor: colors.yellow,
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  childImage: {
    width: 190,
    height: 190,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.purple,
  },
});

export default AddChildScreen;
