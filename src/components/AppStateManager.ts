import {NavigationContainerRef} from '@react-navigation/core';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {queryCache} from 'react-query';

import {useScheduleNotifications} from '../hooks/notificationsHooks';
import {PropType} from '../resources/constants';
import {currentScreen, trackAppLaunch} from '../utils/analytics';

type StateChangeListener = Parameters<PropType<AppState, 'addEventListener'>>[1];

const showChildrenList = (navigation?: NavigationContainerRef | null) => {
  console.log('showChildrenList');
  navigation = navigation ?? currentScreen.navigation?.current;
  navigation?.reset({
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
};

const hideChildrenList = (navigation?: NavigationContainerRef | null) => {
  navigation = navigation ?? currentScreen.navigation?.current;
  navigation?.reset({
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
};

const AppStateManager: React.FC = () => {
  const [appState, setAppState] = useState<AppStateStatus | undefined>();
  const [scheduleNotifications] = useScheduleNotifications();

  useLayoutEffect(() => {
    if (appState === undefined) {
      setTimeout(showChildrenList);
    }
  }, [appState]);

  const _handleAppStateChange: StateChangeListener = (nextAppState) => {
    if (!!appState?.match(/inactive|background/) && nextAppState === 'active') {
      scheduleNotifications();
      queryCache.invalidateQueries('unreadNotifications', {refetchActive: true, refetchInactive: true});
      trackAppLaunch();
      showChildrenList();
    } else {
      hideChildrenList();
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
