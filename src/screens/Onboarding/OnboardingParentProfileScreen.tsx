import React, {useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, sharedStyle} from '../../resources/constants';
import {useNavigation} from '@react-navigation/native';
import LanguageSelector from '../../components/LanguageSelector';
import ParentProfileSelector, {ParentProfileSelectorValues} from '../../components/ParentProfileSelector';
import {useSetParentProfile} from '../../hooks/parentProfileHooks';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PurpleArc} from '../../resources/svg';
import {Text} from 'react-native-paper';
import AEScrollView from '../../components/AEScrollView';
import CancelDoneTopControl from '../../components/CancelDoneTopControl';
import {RootStackParamList} from '../../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import NavBarBackground from '../../resources/svg/NavBarBackground';

const NextScreen: keyof RootStackParamList = 'AddChild';
type ParentProfileNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingParentProfile'>;

const OnboardingParentProfileScreen: React.FC<{}> = () => {
  const {t} = useTranslation('onboardingParentProfile');
  const navigation = useNavigation<ParentProfileNavigationProp>();
  const [profile, setProfile] = useState<undefined | ParentProfileSelectorValues>();
  const [saveProfile] = useSetParentProfile();
  const {top} = useSafeAreaInsets();
  return (
    <AEScrollView>
      <View style={{flex: 1, backgroundColor: colors.iceCold, paddingTop: top, overflow: 'visible'}}>
        <View style={{flexGrow: 3, backgroundColor: 'white', overflow: 'visible'}}>
          <View style={{top: 0, position: 'absolute', width: '100%', height: 275}}>
            <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
            <NavBarBackground width={'100%'} />
          </View>
          <CancelDoneTopControl
            onCancel={() => {
              navigation.navigate(NextScreen, {onboarding: true});
            }}
            onDone={() => {
              navigation.navigate('Dashboard');
            }}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              {
                marginTop: 20,
                textAlign: 'center',
                marginHorizontal: 32,
                textTransform: 'capitalize',
                marginBottom: 40,
              },
              sharedStyle.largeBoldText,
            ]}>
            {t('parentProfile')}
          </Text>
          <View style={{marginHorizontal: 32, zIndex: 20000, marginBottom: 56}}>
            <ParentProfileSelector
              value={profile}
              onChange={(values) => {
                setProfile(values);
                saveProfile(values);
              }}
            />
            <Text style={{textAlign: 'right', marginHorizontal: 50, marginTop: 10}}>{t('common:required')}</Text>
          </View>

          <View style={{flexGrow: 1, justifyContent: 'center', paddingBottom: 40}}>
            <Text
              style={[
                {
                  marginHorizontal: 32,
                  marginBottom: 16,
                  textTransform: 'capitalize',
                },
                sharedStyle.largeBoldText,
              ]}>
              {t('common:appLanguage')}
            </Text>
            <LanguageSelector style={{marginHorizontal: 32}} />
          </View>
        </View>

        <View style={{flexGrow: 2, backgroundColor: 'white'}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, flexGrow: 1}}>
            <AEButtonRounded
              disabled={!profile?.territory}
              onPress={() => {
                navigation.navigate(NextScreen, {
                  onboarding: true,
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
    </AEScrollView>
  );
};

export default OnboardingParentProfileScreen;
