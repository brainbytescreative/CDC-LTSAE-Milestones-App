import i18next from 'i18next';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import PrivacyPolicyV2 from '../resources/privacyPolicyV2';

const PrivacyPolicyScreen: React.FC = () => {
  const {bottom} = useSafeAreaInsets();
  return <WebView source={{html: PrivacyPolicyV2[i18next.language] || ''}} startInLoadingState contentInset={{bottom}} />;
};

export default PrivacyPolicyScreen;
