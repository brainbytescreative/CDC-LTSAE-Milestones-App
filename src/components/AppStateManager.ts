import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {PropType} from '../resources/constants';

type StateChangeListener = Parameters<PropType<AppState, 'addEventListener'>>[1];

const AppStateManager: React.FC = () => {
  const [appState, setAppState] = useState<AppStateStatus | undefined>();

  const _handleAppStateChange: StateChangeListener = (nextAppState) => {
    if (!!appState?.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
    }
    setAppState(nextAppState);
  };

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  });

  return null;
};

export default React.memo(AppStateManager);
