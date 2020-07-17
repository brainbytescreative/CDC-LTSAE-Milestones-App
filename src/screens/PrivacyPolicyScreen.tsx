import i18next from 'i18next';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import PrivacyPolicy from '../resources/privacyPolicy';

const PrivacyPolicyScreen: React.FC = () => {
  const {bottom} = useSafeAreaInsets();
  return <WebView source={{html: PrivacyPolicy[i18next.language] || ''}} startInLoadingState contentInset={{bottom}} />;
};

export default PrivacyPolicyScreen;
