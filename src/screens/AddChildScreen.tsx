import {useActionSheet} from '@expo/react-native-action-sheet';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
// import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import {ImagePickerOptions, ImagePickerResult, MediaTypeOptions} from 'expo-image-picker';
import {ImageInfo} from 'expo-image-picker/src/ImagePicker.types';
import * as Permissions from 'expo-permissions';
import {FastField, FastFieldProps, FieldArray, Formik, FormikProps} from 'formik';
import i18next, {TFunction} from 'i18next';
import _ from 'lodash';
import React, {ComponentProps, useEffect, useLayoutEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, Image, Linking, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonRounded from '../components/AEButtonRounded';
import AERadioButton from '../components/AERadioButton';
import AETextInput from '../components/AETextInput';
import CancelDoneTopControl from '../components/CancelDoneTopControl';
import DatePicker from '../components/DatePicker';
import DropDownPicker from '../components/DropDownPicker';
import {DashboardStackParamList, RootStackParamList} from '../components/Navigator/types';
import Chevron from '../components/Svg/Chevron';
import NavBarBackground from '../components/Svg/NavBarBackground';
import PlusIcon from '../components/Svg/PlusIcon';
import PurpleArc from '../components/Svg/PurpleArc';
import {useAddChild, useGetChild, useUpdateChild} from '../hooks/childrenHooks';
import {ChildResult} from '../hooks/types';
import {colors, sharedStyle} from '../resources/constants';
import {addEditChildSchema} from '../resources/validationSchemas';
import {
  trackAddAnotherChild,
  trackChildAddAPhoto,
  trackChildAddChildName,
  trackChildAge,
  trackChildCompletedAddChildName,
  trackChildCompletedChildDateOfBirth,
  trackChildDone,
  trackChildGender,
  trackChildStartedChildDateOfBirth,
  trackCompleteAddChild,
  trackEventByType,
  trackInteractionByType,
} from '../utils/analytics';

// const options: ImagePickerOptions = {
//   noData: true,
//   quality: 1.0,
//   maxWidth: 500,
//   maxHeight: 500,
//   mediaType: 'photo',
//   storageOptions: {
//     skipBackup: true,
//     privateDirectory: true,
//   },
// };

const options: ImagePickerOptions = {
  mediaTypes: MediaTypeOptions.Images,
  quality: 1,
};

type AddChildRouteProp = RouteProp<DashboardStackParamList, 'AddChild'>;
type AddChildScreenNavigationProp = StackNavigationProp<DashboardStackParamList, 'AddChild'> &
  StackNavigationProp<RootStackParamList, 'AddChild'>;

const NextScreen: keyof RootStackParamList = 'OnboardingHowToUse';

interface CommonFieldProps {
  t: TFunction;
  name: string;
}
enum ActionSheetOptions {
  takePhoto,
  library,
  cancel,
}

const PhotoField: React.FC<CommonFieldProps> = ({t, name}) => {
  const {showActionSheetWithOptions} = useActionSheet();

  return (
    <FastField name={name}>
      {({field, form}: FastFieldProps<string | undefined>) => (
        <View style={{alignItems: 'center', marginTop: 30, marginBottom: 20}}>
          <View style={[sharedStyle.shadow]}>
            <TouchableOpacity
              accessibilityRole={'button'}
              accessibilityLabel={t('accessibility:addChildPhoto')}
              onPress={() => {
                trackChildAddAPhoto();

                let interactionType: 'camera' | 'lib' | undefined;

                showActionSheetWithOptions(
                  {
                    message: t('common:selectAPhoto'),
                    cancelButtonIndex: 2,
                    options: [t('common:takePhoto'), t('common:choseFromLibrary'), t('common:cancel')],
                    textStyle: {...sharedStyle.regularText},
                    titleTextStyle: {...sharedStyle.regularText},
                    messageTextStyle: {...sharedStyle.regularText},
                  },
                  async (i: ActionSheetOptions) => {
                    let result: (ImagePickerResult & ImageInfo) | undefined;
                    switch (i) {
                      case ActionSheetOptions.takePhoto:
                        {
                          let {status: aksStatus} = await Permissions.getAsync('camera');
                          if (aksStatus !== 'granted') {
                            const {status: getStatus} = await Permissions.askAsync('camera');
                            aksStatus = getStatus;
                          }

                          result =
                            aksStatus === 'granted'
                              ? ((await ImagePicker.launchCameraAsync(options)) as any)
                              : undefined;
                          trackInteractionByType('Take Photo');
                          interactionType = 'camera';
                        }
                        break;
                      case ActionSheetOptions.library:
                        {
                          let {status: aksStatus} = await Permissions.getAsync('cameraRoll');
                          if (aksStatus !== 'granted') {
                            const {status: getStatus} = await Permissions.askAsync('cameraRoll');
                            aksStatus = getStatus;
                          }

                          result =
                            aksStatus === 'granted'
                              ? ((await ImagePicker.launchImageLibraryAsync(options)) as any)
                              : undefined;
                          trackInteractionByType('Add Photo from Library');
                          interactionType = 'lib';
                        }
                        break;
                      case ActionSheetOptions.cancel:
                        break;
                    }

                    if (result?.uri) {
                      trackInteractionByType('Completed Add Photo');
                      interactionType &&
                        interactionType === 'camera' &&
                        trackInteractionByType('Completed Add Photo: Take');
                      interactionType &&
                        interactionType === 'lib' &&
                        trackInteractionByType('Completed Add Photo: Library');
                      form.setFieldValue(field.name, result.uri);
                    }
                  },
                );
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
};

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
          style={[Boolean(meta.error && meta.touched) && sharedStyle.errorOutline]}
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
            error={Boolean(meta.error && meta.touched)}
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
        <View style={{marginTop: 20, marginBottom: 16, marginLeft: 8}}>
          <Text>{t('selectOne')}</Text>
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
                Boolean(meta.error && meta.touched) && {...sharedStyle.errorOutline, paddingVertical: 1},
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

const PrematureRadioField: React.FC<CommonFieldProps> = ({t, name}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<0 | 1 | undefined>) => (
        <View style={{marginTop: 20, marginBottom: 16, marginLeft: 8}}>
          <Text>{t('prematureQuestion')}</Text>
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
                Boolean(meta.error && meta.touched) && {...sharedStyle.errorOutline, paddingVertical: 1},
              ]}>
              <AERadioButton
                onChange={() => form.setFieldValue(field.name, true)}
                value={Boolean(field.value)}
                title={t('dialog:yes')}
                titleStyle={{marginRight: 32}}
              />
              <AERadioButton
                onChange={() => form.setFieldValue(field.name, false)}
                value={!field.value}
                title={t('dialog:no')}
                titleStyle={{marginRight: 0}}
              />
            </View>
          </View>
        </View>
      )}
    </FastField>
  );
};

const weeks: ComponentProps<typeof DropDownPicker>['items'] = Array.from(new Array(16)).map((value, index) => ({
  label: i18next.t('common:week', {count: index + 1}),
  value: index + 1,
}));

const PrematureWeeksField: React.FC<CommonFieldProps> = ({t, name}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<0 | 1 | undefined>) => (
        <>
          <DropDownPicker
            itemsContainerStyle={{
              borderRightWidth: 1,
              borderLeftWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.gray,
              height: 130,
            }}
            containerStyle={[meta.error && meta.touched ? sharedStyle.errorOutline : null]}
            customArrowDown={<Chevron direction={'up'} />}
            customArrowUp={<Chevron direction={'down'} />}
            labelStyle={[sharedStyle.regularText, {flexGrow: 1}]}
            style={[
              sharedStyle.shadow,
              {
                padding: 5,
                borderWidth: 1,
                borderColor: colors.gray,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
              },
            ]}
            placeholder={`${t('numberOfWeeksPremature')} *`}
            placeholderColor={colors.gray}
            items={weeks}
            defaultNull
            dropDownMaxHeight={140}
            value={field.value}
            zIndex={1000}
            onChangeItem={(item) => {
              form.setFieldValue(field.name, item.value);
            }}
          />
        </>
      )}
    </FastField>
  );
};

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
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const firstChild: Partial<ChildResult> = {
    name: '',
    gender: undefined,
    birthday: undefined,
    photo: undefined,
    isPremature: false,
    ...route.params?.child,
  };

  const initialValues: {
    firstChild: typeof firstChild;
    anotherChildren?: typeof firstChild[];
  } = {
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
    child &&
      formikRef.current?.setValues({
        firstChild: child.realBirthDay ? {...child, birthday: child.realBirthDay} : child,
        anotherChildren: [],
      });
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

  // const onPrematureTipPress = useCallback(() => {
  //   scrollViewRef.current?.scrollToEnd();
  // }, [scrollViewRef]);

  return (
    <KeyboardAwareScrollView
      // key={__DEV__ ? Math.random() : undefined}
      innerRef={(ref) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scrollViewRef.current = ref;
      }}
      enableOnAndroid={Platform.OS === 'android'}
      bounces={false}
      style={{flex: 1}}>
      <Formik
        initialValues={initialValues}
        validationSchema={addEditChildSchema}
        innerRef={formikRef}
        validateOnChange
        // validateOnMount
        onSubmit={async (values) => {
          const childInput = {
            ...values.firstChild,
            birthday: values.firstChild.birthday!,
            gender: values.firstChild.gender || 0,
          } as ChildResult;

          if (childId) {
            const updateData = {...childInput, id: childId};
            updateChild(updateData).then(() => {
              trackChildAge(values.firstChild.birthday);
              trackChildGender(Number(values.firstChild.gender));
            });
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
            } as ChildResult;
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
              {!route.params?.onboarding || !_.isEmpty(formikProps.values.anotherChildren) ? (
                <CancelDoneTopControl
                  disabled={isLoading || !formikProps.isValid}
                  onCancel={route.params?.onboarding ? undefined : onCancel}
                  // onDone={onDone}
                />
              ) : (
                <View style={{height: 18}} />
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
              <PrematureRadioField t={t} name={'firstChild.isPremature'} />
            </View>
            <View style={{backgroundColor: colors.white, paddingHorizontal: 32, paddingBottom: 32}}>
              {formikProps.values.firstChild.isPremature && (
                <PrematureWeeksField t={t} name={'firstChild.weeksPremature'} />
              )}
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
                        <PrematureRadioField t={t} name={`anotherChildren.${index}.isPremature`} />
                        {Boolean(formikProps.values?.anotherChildren?.[index].isPremature) && (
                          <PrematureWeeksField t={t} name={`anotherChildren.${index}.weeksPremature`} />
                        )}
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
                  <View
                    style={{
                      backgroundColor: colors.white,
                      flexGrow: 2,
                      justifyContent: 'space-between',
                    }}>
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
                          onPress={() => {
                            trackEventByType('Link', 'Corrected Age');
                            return Linking.openURL(t('correctedAgeLink'));
                          }}
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
    </KeyboardAwareScrollView>
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
