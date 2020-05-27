import React from 'react';
import {colors, sharedStyle} from '../resources/constants';
import {Image, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Trans, useTranslation} from 'react-i18next';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import AEScrollView from '../components/AEScrollView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NotificationsBadge from '../components/NotificationsBadge';
import CDCLogo from '../components/Svg/CDCLogo';

const InfoScreen: React.FC = () => {
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
        <Text style={{marginHorizontal: 32, marginTop: 21, fontSize: 15, lineHeight: 25}}>
          <Trans t={t} i18nKey={'aboutThisAppText'}>
            <Text style={{textDecorationLine: 'underline'}} />
            <Text style={sharedStyle.boldText} />
            <Text style={{textDecorationLine: 'underline'}} />
          </Trans>
        </Text>
        <View style={styles.logosRow}>
          <CDCLogo />
          <Image style={{marginLeft: 24}} source={require('../resources/images/LTSAE_Logo.png')} />
        </View>
        <Text style={[sharedStyle.largeBoldText, {marginTop: 34, marginHorizontal: 32}]}>{t('privacyPolicy')}</Text>
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
