import React, {useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {colors, routeKeys} from '../../resources/constants';
import {useNavigation} from '@react-navigation/native';
import LanguageSelector from '../../components/LanguageSelector';
import ParentProfileSelector, {ParentProfileSelectorValues} from '../../components/ParentProfileSelector';
import {useSetParentProfile} from '../../hooks/parentProfileHooks';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {useSafeArea} from 'react-native-safe-area-context';
import {NabBarBackground, PurpleArc} from '../../resources/svg';
import {Text} from 'react-native-paper';

const OnboardingParentProfileScreen: React.FC<{}> = () => {
  const {t} = useTranslation('onboardingParentProfile');
  const navigation = useNavigation();
  const [profile, setProfile] = useState<undefined | ParentProfileSelectorValues>();
  const [saveProfile] = useSetParentProfile();
  const {top} = useSafeArea();
  return (
    <View style={{flex: 1, paddingTop: top, backgroundColor: colors.white}}>
      <View style={{position: 'absolute', width: '100%'}}>
        <View style={{backgroundColor: colors.iceCold, height: 200}} />
        <NabBarBackground width={'100%'} />
      </View>

      <View style={{flexGrow: 1, justifyContent: 'space-around'}}>
        <Text
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            margin: 10,
            fontSize: 22,
            marginHorizontal: 32,
            textTransform: 'capitalize',
          }}>
          {t('parentProfile')}
        </Text>
        <View>
          <ParentProfileSelector
            onChange={(values) => {
              setProfile(values);
              saveProfile(values);
            }}
          />
          <Text style={{textAlign: 'right', marginHorizontal: 50, marginTop: 10}}>{t('common:required')}</Text>
        </View>
      </View>

      <View style={{flexGrow: 3, justifyContent: 'center'}}>
        <Text style={{fontSize: 22, fontWeight: 'bold', marginHorizontal: 32}}>{t('common:appLanguage')}</Text>
        <LanguageSelector style={{marginHorizontal: 32}} />
      </View>

      <View style={{flexGrow: 2}}>
        <PurpleArc width={'100%'} />
        <View style={{backgroundColor: colors.purple, flexGrow: 1}}>
          <AEButtonRounded
            disabled={!profile?.territory}
            onPress={() => {
              navigation.navigate(routeKeys.OnboardingHowToUse);
            }}>
            {t('common:next')}
          </AEButtonRounded>
          <Text style={{fontSize: 15, marginHorizontal: 50}}>{t('territoryInfo')}</Text>
        </View>
      </View>
    </View>
  );
};

export default OnboardingParentProfileScreen;
