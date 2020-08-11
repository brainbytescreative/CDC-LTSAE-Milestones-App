import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Formik, FormikProps} from 'formik';
import i18next from 'i18next';
import _ from 'lodash';
import React, {useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Alert, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonRounded from '../../components/AEButtonRounded';
import AEScrollView from '../../components/AEScrollView';
import LanguageSelector from '../../components/LanguageSelector';
import {RootStackParamList} from '../../components/Navigator/types';
import ParentProfileSelector from '../../components/ParentProfileSelector';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import PurpleArc from '../../components/Svg/PurpleArc';
import {useSetParentProfile} from '../../hooks/parentProfileHooks';
import {colors, sharedStyle} from '../../resources/constants';
import {editProfileSchema} from '../../resources/validationSchemas';
import {trackNext, trackSelectLanguage} from '../../utils/analytics';

const NextScreen: keyof RootStackParamList = 'AddChild';
type ParentProfileNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingParentProfile'>;

const OnboardingParentProfileScreen: React.FC = () => {
  const {t} = useTranslation('onboardingParentProfile');
  const navigation = useNavigation<ParentProfileNavigationProp>();
  const [saveProfile, {isLoading: saveInProgress}] = useSetParentProfile();
  const {top} = useSafeAreaInsets();
  const formikRef = useRef<FormikProps<any>>(null);
  //
  // useLayoutEffect(() => {
  //   formikRef.current?.validateForm();
  // }, []);

  return (
    <AEScrollView>
      <Formik
        innerRef={formikRef}
        validationSchema={editProfileSchema}
        validateOnChange
        initialValues={{
          territory: undefined,
          guardian: undefined,
        }}
        onSubmit={async (values) => {
          await saveProfile(values);
          trackNext();
          navigation.navigate(NextScreen, {
            onboarding: true,
          });
        }}>
        {(formik) => (
          <View style={{flex: 1, backgroundColor: colors.iceCold, paddingTop: top, overflow: 'visible'}}>
            <View style={{flexGrow: 3, backgroundColor: 'white', overflow: 'visible'}}>
              <View style={{top: 0, position: 'absolute', width: '100%', height: 275}}>
                <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
                <NavBarBackground width={'100%'} />
              </View>
              {/*<CancelDoneTopControl*/}
              {/*  onCancel={() => {*/}
              {/*    navigation.navigate(NextScreen, {onboarding: true});*/}
              {/*  }}*/}
              {/*  onDone={() => {*/}
              {/*    // navigation.navigate('Dashboard');*/}
              {/*    trackNext();*/}
              {/*    navigation.navigate(NextScreen, {*/}
              {/*      onboarding: true,*/}
              {/*    });*/}
              {/*  }}*/}
              {/*/>*/}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  {
                    marginTop: 20,
                    textAlign: 'center',
                    marginHorizontal: 32,
                    marginBottom: 40,
                  },
                  sharedStyle.largeBoldText,
                ]}>
                {t('parentProfile')}
              </Text>
              <View style={{marginHorizontal: 32, zIndex: 20000, marginBottom: 56}}>
                <ParentProfileSelector key={`ParentProfileSelector-${i18next.language}`} />
                <Text style={[{textAlign: 'right', marginHorizontal: 50, marginTop: 10}, sharedStyle.required]}>
                  {t('common:required')}
                </Text>
              </View>

              <View style={{flexGrow: 1, justifyContent: 'center', paddingBottom: 40}}>
                <Text
                  style={[
                    {
                      marginHorizontal: 32,
                      marginBottom: 16,
                    },
                    sharedStyle.largeBoldText,
                  ]}>
                  {t('common:appLanguage')}
                </Text>
                <LanguageSelector
                  onLanguageChange={(lng) => {
                    trackSelectLanguage(lng);
                  }}
                  style={{marginHorizontal: 32}}
                />
              </View>
            </View>

            <View style={{flexGrow: 2, backgroundColor: 'white'}}>
              <PurpleArc width={'100%'} />
              <View style={{backgroundColor: colors.purple, flexGrow: 1}}>
                <AEButtonRounded
                  disabled={saveInProgress}
                  onPress={async () => {
                    formik.handleSubmit();
                    formik.validateForm().then((errors) => {
                      !_.isEmpty(errors) && Alert.alert('', t('alert:selectStateTerritory'));
                    });
                  }}>
                  {t('common:next')}
                </AEButtonRounded>
                <Text
                  style={{
                    fontSize: 15,
                    marginHorizontal: 50,
                    marginBottom: 16,
                  }}>
                  {t('territoryInfo')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Formik>
    </AEScrollView>
  );
};

export default OnboardingParentProfileScreen;
