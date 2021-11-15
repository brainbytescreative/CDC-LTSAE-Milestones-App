import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Modal, Portal, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonMultiline from '../../components/AEButtonMultiline';
import AEScrollView from '../../components/AEScrollView';
import LanguageSelector from '../../components/LanguageSelector';
import LTSAELogo from '../../components/LTSAELogo';
import {OnboardingNavigationProp} from '../../components/Navigator/types';
import CDCLogo from '../../components/Svg/CDCLogo';
import IceColdArc from '../../components/Svg/IceColdArc';
import PurpleArc from '../../components/Svg/PurpleArc';
import {useGetWhatHasChangedPopUpSeen, useSetWhatHasChangedPopUpSeen} from '../../hooks/modalPopUpsHooks';
import {useGetHideDataArchiveButton, useSetHideDataArchiveButton} from '../../hooks/dashboardHooks';
import {colors, sharedStyle} from '../../resources/constants';
import {trackSelectLanguage, trackStartTracking} from '../../utils/analytics';

const OnboardingInfoScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const {t} = useTranslation('onboardingInfo');
  const navigation = useNavigation<OnboardingNavigationProp>();
  const {bottom, top} = useSafeAreaInsets();
  const {data: whatHasChangedPopUpSeen} = useGetWhatHasChangedPopUpSeen();
  const [setWhatHasChangedPopUpSeen] = useSetWhatHasChangedPopUpSeen();
  const {data: hideDataArchiveButton} = useGetHideDataArchiveButton();
  const [setHideDataArchiveButton] = useSetHideDataArchiveButton();

  useEffect(() => {
    if (!whatHasChangedPopUpSeen) {
      setWhatHasChangedPopUpSeen(true);
    }
    if (!hideDataArchiveButton) {
      setHideDataArchiveButton(true);
    }
  }, []);

  return (
    <AEScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flexGrow: 2}}>
          <View style={{backgroundColor: colors.iceCold, flexGrow: 1, justifyContent: 'space-around'}}>
            <View style={{alignItems: 'center', marginTop: 16 + top}}>
              <Text style={[{fontSize: 20, textAlign: 'center', marginBottom: 8}, sharedStyle.boldText]}>
                {t('welcome')}
              </Text>
              <Text style={{fontSize: 16, marginBottom: 24}}>{t('broughtToYouBy')}</Text>
              <View style={styles.logosRow}>
                <CDCLogo />
                <LTSAELogo />
              </View>
            </View>
          </View>
          <IceColdArc width={'100%'} />
        </View>

        <View style={{backgroundColor: 'white', flexGrow: 1, justifyContent: 'center'}}>
          <Text
            style={{
              marginHorizontal: 32,
              marginVertical: 16,
              textAlign: 'center',
              fontSize: 16,
            }}>
            {t('welcome1p')}
          </Text>
        </View>

        <View style={{flexGrow: 3}}>
          <PurpleArc width={'100%'} />
          <View
            style={{
              flexGrow: 1,
              backgroundColor: colors.purple,
              paddingBottom: bottom,
              justifyContent: 'space-around',
              paddingTop: 20,
            }}>
            <Text
              style={[
                {
                  marginHorizontal: 32,
                  textAlign: 'center',
                },
                sharedStyle.largeBoldText,
              ]}>
              {t('welcome2p')}
            </Text>
            <View
              style={{
                marginHorizontal: 32,
                marginTop: 16,
              }}>
              {Array.from(new Array(5)).map((value, index) => (
                <View style={[{flexDirection: 'row'}, index !== 0 && {marginTop: 6}]} key={`list-item-${index}`}>
                  <Text style={[sharedStyle.boldText, {fontSize: 16}]}>{'•   '}</Text>
                  <Text style={[{fontSize: 16}]}>{t('list', {context: `${index}`})}</Text>
                </View>
              ))}
            </View>
            <AEButtonMultiline
              onPress={() => {
                navigation.navigate('OnboardingParentProfile');
                trackStartTracking();
              }}>
              {t('getStartedBtn')}
            </AEButtonMultiline>
          </View>
        </View>

        <Portal>
          <Modal
            contentContainerStyle={{
              backgroundColor: '#fff',
              margin: 32,
              paddingHorizontal: 16,
              paddingVertical: 22,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.darkGray,
            }}
            onDismiss={() => {
              setVisible(false);
            }}
            visible={visible}>
            <LanguageSelector
              title={'Select a Language/Seleccione un idioma'}
              onLanguageChange={(language) => trackSelectLanguage(language, {page: 'Language Pop-Up'})}
            />
            <TouchableOpacity
              accessibilityRole={'button'}
              onPress={() => {
                setVisible(false);
              }}>
              <Text
                style={[
                  {
                    textAlign: 'center',
                    marginTop: 16,
                  },
                  sharedStyle.largeBoldText,
                ]}>
                {t('common:done')}
              </Text>
            </TouchableOpacity>
          </Modal>
        </Portal>
      </View>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  logosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingInfoScreen;
