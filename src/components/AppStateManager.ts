import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {PropType} from '../resources/constants';
import {useScheduleNotifications} from '../hooks/notificationsHooks';
import {trackAppLaunch} from '../utils/analytics';

type StateChangeListener = Parameters<PropType<AppState, 'addEventListener'>>[1];

const AppStateManager: React.FC = () => {
  const [appState, setAppState] = useState<AppStateStatus | undefined>();
  const [scheduleNotifications] = useScheduleNotifications();

  const _handleAppStateChange: StateChangeListener = (nextAppState) => {
    if (!!appState?.match(/inactive|background/) && nextAppState === 'active') {
      scheduleNotifications();
      trackAppLaunch();
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
