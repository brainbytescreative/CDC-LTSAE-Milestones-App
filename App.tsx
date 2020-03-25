/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {SafeAreaView} from 'react-native';
import Database from './src/db';

declare var global: {HermesInternal: null | {}};

const App = () => {
  useEffect(() => {
    Database.connect().then(async () => {
      const children = await Database.getAllChildren();
      console.log(children);
    });
  });

  return (
    <>
      <SafeAreaView />
    </>
  );
};

export default App;
