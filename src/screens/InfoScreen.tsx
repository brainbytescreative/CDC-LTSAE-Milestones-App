import {NavigationProp} from '@react-navigation/native';
import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Linking, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEScrollView from '../components/AEScrollView';
import LTSAELogo from '../components/LTSAELogo';
import {InfoStackParamList} from '../components/Navigator/types';
import NotificationsBadge from '../components/NotificationsBadge/NotificationsBadge';
import CDCLogo from '../components/Svg/CDCLogo';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import {breakStr, breakStrLarge, colors, sharedStyle} from '../resources/constants';
import {trackEventByType} from '../utils/analytics';

const InfoScreen: React.FC<{navigation: NavigationProp<InfoStackParamList>}> = ({navigation}) => {
  const {t} = useTranslation('info');
  const {bottom} = useSafeAreaInsets();
  return (
    <View style={{backgroundColor: colors.white, flex: 1}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <NotificationsBadge />
      <AEScrollView>
        <Text style={[sharedStyle.screenTitle]}>{t('aboutThisApp')}</Text>
        {/*<Text style={{marginHorizontal: 32, marginTop: 21, fontSize: 15, lineHeight: 25}}>*/}
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 32, marginTop: 21}}>
          <Text>
            <Trans t={t} i18nKey={'aboutThisAppTextCovid'} tOptions={{breakStr, breakStrLarge}}>
              <Text
                accessibilityRole={'link'}
                onPress={() => {
                  trackEventByType('Link', 'Act Early', {page: 'App Info & Privacy Policy'});
                  return Linking.openURL(t('actEarlyLink'));
                }}
                style={[sharedStyle.regularText, {textDecorationLine: 'underline'}, {fontSize: 15, lineHeight: 25}]}
              />
              <Text style={[sharedStyle.boldText, {fontSize: 15, lineHeight: 25}]} />
              <Text
                accessibilityRole={'link'}
                onPress={() => {
                  trackEventByType('Link', 'Act Early', {page: 'App Info & Privacy Policy'});
                  return Linking.openURL(t('actEarlyLink2'));
                }}
                style={[{textDecorationLine: 'underline'}, {fontSize: 15, lineHeight: 25}]}
              />
              <Text style={{fontSize: 15, lineHeight: 25}}>
                <Text style={[sharedStyle.boldText, {fontSize: 15, lineHeight: 25}]} />
                <Text style={[sharedStyle.boldText, {fontSize: 15, lineHeight: 25}]} />
              </Text>
              <Text style={{fontFamily: 'Montserrat-Italic'}} />
            </Trans>
          </Text>
        </View>
        {/*</Text>*/}
        <View style={styles.logosRow}>
          <CDCLogo />
          <LTSAELogo />
        </View>
        <Text
          onPress={() => {
            navigation.navigate('PrivacyPolicy');
          }}
          style={[
            sharedStyle.largeBoldText,
            {marginTop: 34, marginHorizontal: 32, textDecorationLine: 'underline', color: colors.blueLink},
          ]}>
          {t('privacyPolicy')}
        </Text>
        <Text style={{marginHorizontal: 32, marginTop: 21, fontSize: 15, lineHeight: 25, marginBottom: bottom + 50}}>
          {t('privacyPolicyText')}
        </Text>
      </AEScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  logosRow: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InfoScreen;
