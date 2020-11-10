import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {queryCache} from 'react-query';

import {useScheduleNotifications} from '../hooks/notificationsHooks';
import {PropType} from '../resources/constants';
import {currentScreen, trackAppLaunch} from '../utils/analytics';

type StateChangeListener = Parameters<PropType<AppState, 'addEventListener'>>[1];

const AppStateManager: React.FC = () => {
  const [appState, setAppState] = useState<AppStateStatus | undefined>();
  const [scheduleNotifications] = useScheduleNotifications();

  const _handleAppStateChange: StateChangeListener = (nextAppState) => {
    if (!!appState?.match(/inactive|background/) && nextAppState === 'active') {
      scheduleNotifications();
      queryCache.invalidateQueries('unreadNotifications', {refetchActive: true, refetchInactive: true});
      trackAppLaunch();

      currentScreen.navigation?.current?.reset({
        index: 0,
        routes: [
          {
            name: 'DashboardStack',
            state: {
              index: 1,
              routes: [
                {
                  name: 'Dashboard',
                  params: {
                    addChild: true,
                  },
                },
              ],
            },
          },
        ],
      });
    } else {
      currentScreen.navigation?.current?.reset({
        index: 0,
        routes: [
          {
            name: 'DashboardStack',
            state: {
              index: 1,
              routes: [
                {
                  name: 'Dashboard',
                  params: {
                    addChild: undefined,
                  },
                },
              ],
            },
          },
        ],
      });
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
