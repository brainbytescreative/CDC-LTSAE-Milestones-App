import React from 'react';
import {WebView} from 'react-native-webview';
import i18next from 'i18next';
import {LanguageType} from '../resources/constants';
import {Platform, SafeAreaView} from 'react-native';
import NotificationsBadge from '../components/NotificationsBadge';
import {WebViewSource} from 'react-native-webview/lib/WebViewTypes';

const policy = {
  en: Platform.select<WebViewSource>({
    ios: require('../resources/html/en/aboutAndPolicy.html'),
    android: {uri: 'file:///android_asset/html/en/aboutAndPolicy.html'},
  }),
  es: Platform.select({
    ios: require('../resources/html/es/aboutAndPolicy.html'),
    android: {uri: 'file:///android_asset/html/es/aboutAndPolicy.html'},
  }),
};

const InfoScreen: React.FC<{}> = () => {
  const source = policy[i18next.language as LanguageType];
  return (
    <SafeAreaView style={{flex: 1}}>
      <NotificationsBadge />
      <WebView
        originWhitelist={['*']}
        scalesPageToFit={false}
        startInLoadingState
        mixedContentMode={'compatibility'}
        style={{flex: 1}}
        source={source}
      />
    </SafeAreaView>
  );
};

export default InfoScreen;
