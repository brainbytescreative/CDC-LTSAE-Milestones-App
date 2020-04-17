import React from 'react';
import {WebView} from 'react-native-webview';
import i18next from 'i18next';
import {LanguageType} from '../resources/constants';
import {SafeAreaView} from 'react-native';
import NotificationsBadge from '../components/NotificationsBadge';

const policy = {
  en: require('../resources/html/en/aboutAndPolicy.html'),
  es: require('../resources/html/es/aboutAndPolicy.html'),
};

const InfoScreen: React.FC<{}> = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <NotificationsBadge />
      <WebView
        originWhitelist={['*']}
        scalesPageToFit={false}
        startInLoadingState
        mixedContentMode={'compatibility'}
        style={{flex: 1}}
        source={policy[i18next.language as LanguageType]}
      />
    </SafeAreaView>
  );
};

export default InfoScreen;
