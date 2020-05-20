import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {FastField, FastFieldProps, FieldArray, Formik, FormikProps} from 'formik';
import ImagePicker from 'react-native-image-picker';
import DatePicker from '../components/DatePicker';
import {useAddChild, useGetChild, useUpdateChild} from '../hooks/childrenHooks';

import {StackNavigationProp} from '@react-navigation/stack';
import {DashboardStackParamList, RootStackParamList} from '../components/Navigator/types';
import {colors, sharedStyle} from '../resources/constants';
import CancelDoneTopControl from '../components/CancelDoneTopControl';
import AETextInput from '../components/AETextInput';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {PlusIcon, PurpleArc} from '../resources/svg';
import AEScrollView from '../components/AEScrollView';
import NavBarBackground from '../resources/svg/NavBarBackground';
import {TFunction} from 'i18next';
import {addEditChildSchema} from '../resources/validationSchemas';
import _ from 'lodash';
import AERadioButton from '../components/AERadioButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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

interface CommonFieldProps {
  t: TFunction;
  name: string;
}

const PhotoField: React.FC<CommonFieldProps> = ({t, name}) => (
  <FastField name={name}>
    {({field, form, meta}: FastFieldProps<string | undefined>) => (
      <View style={{alignItems: 'center', marginTop: 30, marginBottom: 20}}>
        <View style={[sharedStyle.shadow]}>
          <TouchableOpacity
            onPress={() => {
              ImagePicker.showImagePicker(options, (response) => {
                if (response.uri) {
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
        <Text style={{marginTop: 10, fontSize: 15}}>{t('addPhoto')}</Text>
      </View>
    )}
  </FastField>
);

const NameField: React.FC<CommonFieldProps> = ({t, name}) => {
  return (
    <FastField name={name}>
      {({field, form, meta}: FastFieldProps<string>) => (
        <AETextInput
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
        <DatePicker
          value={field.value}
          label={t('fields:dateOfBirthPlaceholder')}
          onChange={(date) => form.setFieldValue(name, date)}
        />
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
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
              titleStyle={{marginRight: 32}}
            />
          </View>
          <Text style={{textAlign: 'right'}}>{t('common:required')}</Text>
        </View>
      )}
    </FastField>
  );
};

const PrematureTip: React.FC<{t: TFunction} & Pick<TouchableWithoutFeedbackProps, 'onPress'>> = ({t, onPress}) => (
  <TouchableWithoutFeedback onPress={onPress}>
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

const AddChildScreen: React.FC<{}> = () => {
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

  const formikRef = useRef<FormikProps<typeof initialValues> | undefined>(undefined);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    child && formikRef.current?.setValues({firstChild: child, anotherChildren: []});
  }, [child]);

  const onDone = () => {
    formikRef.current?.handleSubmit();
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
    <AEScrollView innerRef={scrollViewRef}>
      <Formik
        initialValues={initialValues}
        validationSchema={addEditChildSchema}
        innerRef={(ref) => (formikRef.current = ref)}
        validateOnChange
        validateOnMount
        onSubmit={(values) => {
          const childInput = {
            ...values.firstChild,
            birthday: values.firstChild.birthday || new Date(),
            gender: values.firstChild.gender || 0,
          };

          if (childId) {
            updateChild({...childInput, id: childId}).then();
          } else {
            addChild({data: childInput, isAnotherChild: !!route.params?.anotherChild}).then();
          }

          Promise.all(
            values.anotherChildren?.map((item) => {
              const otherInput = {
                ...item,
                birthday: item.birthday || new Date(),
                gender: item.gender || 0,
              };

              return addChild({data: otherInput, isAnotherChild: true});
            }) || [],
          );
        }}>
        {(formikProps) => (
          // <>{console.log(formikProps.values.firstChild)}</>
          <View style={{backgroundColor: colors.iceCold, paddingTop: top, flex: 1}}>
            <View style={{backgroundColor: colors.white, flexGrow: 1, justifyContent: 'space-between'}}>
              <View style={{top: 0, position: 'absolute', width: '100%', height: '80%'}}>
                <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
                <NavBarBackground width={'100%'} />
              </View>
              <CancelDoneTopControl onCancel={onCancel} onDone={onDone} />
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
              <PrematureTip
                t={t}
                onPress={() => {
                  scrollViewRef.current?.scrollToEnd();
                }}
              />
              <GenderField t={t} name={'firstChild.gender'} />
            </View>

            <FieldArray name={'anotherChildren'}>
              {(arrayHelpers) => (
                <>
                  <View style={{backgroundColor: colors.white, paddingHorizontal: 32}}>
                    {formikProps.values.anotherChildren?.map((item, index) => (
                      <>
                        <PhotoField name={`anotherChildren.${index}.photo`} t={t} />
                        <NameField t={t} name={`anotherChildren.${index}.name`} />
                        <View style={{height: 11}} />
                        <BirthdayField name={`anotherChildren.${index}.birthday`} t={t} />
                        <PrematureTip t={t} />
                        <GenderField t={t} name={`anotherChildren.${index}.gender`} />
                      </>
                    ))}
                  </View>
                  <View style={{backgroundColor: colors.white, flexGrow: 2, justifyContent: 'space-between'}}>
                    <PurpleArc width={'100%'} />
                    <View style={{backgroundColor: colors.purple, flexGrow: 2, paddingBottom: bottom ? bottom : 16}}>
                      <View style={{marginTop: 50}}>
                        <AEButtonRounded
                          disabled={isLoading || !formikProps.isValid}
                          style={{marginVertical: 0}}
                          onPress={() => {
                            const anotherChildren = formikProps.values.anotherChildren;
                            const prevChild =
                              anotherChildren && anotherChildren?.length > 0
                                ? _.last(anotherChildren)
                                : formikProps.values.firstChild;

                            arrayHelpers.push({
                              name: prevChild?.name || '',
                              birthday: prevChild?.birthday,
                              gender: prevChild?.gender,
                            });
                          }}>
                          {t('addAnotherChild').toUpperCase()}
                        </AEButtonRounded>
                        <AEButtonRounded
                          disabled={isLoading || !formikProps.isValid}
                          style={{marginBottom: 24}}
                          onPress={onDone}>
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
