import React from 'react';
import WebView from 'react-native-webview';
import PrivacyPolicy from '../resources/privacyPolicy';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import i18next from 'i18next';

const PrivacyPolicyScreen: React.FC = () => {
  const {bottom} = useSafeAreaInsets();
  return <WebView source={{html: PrivacyPolicy[i18next.language] || ''}} startInLoadingState contentInset={{bottom}} />;
};

export default PrivacyPolicyScreen;
