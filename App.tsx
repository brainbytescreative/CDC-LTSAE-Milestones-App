/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import Navigator from './src/components/Navigator';
import {I18nextProvider} from 'react-i18next';
import i18next from './src/resources/l18n';
import {DefaultTheme, Provider as PaperProvider, Theme} from 'react-native-paper';
import {initialize} from './src/db';
import {DowngradeError} from './src/db/SQLiteClient';
import {ReactQueryConfigProvider, ReactQueryProviderConfig} from 'react-query';
import {colors} from './src/resources/constants';
import {ACPAnalytics} from '@adobe/react-native-acpanalytics';

ACPAnalytics.registerExtension();

console.disableYellowBox = true;

const theme: Theme = {
  ...DefaultTheme,
  fonts: {
    regular: {fontFamily: 'Montserrat-Regular'},
    medium: {fontFamily: 'Montserrat-Bold'},
    light: {fontFamily: 'Montserrat-Regular'},
    thin: {fontFamily: 'Montserrat-Regular'},
  },
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
    primary: 'black',
    backdrop: colors.whiteTransparent,
    // accent: 'yellow',
  },
};

const queryConfig: ReactQueryProviderConfig = {
  suspense: false,
  staleTime: Infinity,
  onError: console.warn,
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        // todo implement error handling
        if (err instanceof DowngradeError) {
          // setErrorMessage('Downgrade error');
        } else {
          // setErrorMessage('Unexpected error');
        }
        // setError(true);
        // setLoading(false);
        console.warn(err);
        setLoading(false);
      });
    ACPAnalytics.extensionVersion().then((version) =>
      console.log('AdobeExperienceSDK: ACPAnalytics version: ' + version),
    );
  });

  return (
    <ReactQueryConfigProvider config={queryConfig}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <I18nextProvider i18n={i18next}>{!loading && <Navigator />}</I18nextProvider>
        </NavigationContainer>
      </PaperProvider>
    </ReactQueryConfigProvider>
  );
};

export default App;
