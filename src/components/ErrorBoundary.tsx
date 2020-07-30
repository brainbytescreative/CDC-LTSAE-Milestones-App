import crashlytics from '@react-native-firebase/crashlytics';
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {colors} from '../resources/constants';
import AEButtonRounded from './AEButtonRounded';

type StateType = {
  error?: Error | null;
};
export default class ErrorBoundary extends React.Component<any> {
  state: StateType = {};
  static getDerivedStateFromError(error: Error) {
    crashlytics().recordError(error);
    return {error};
  }
  // componentDidCatch(error: any, errorInfo: any) {
  //   // You can also log the error to an error reporting service
  //   console.log('>>>>componentDidCatch');
  // }

  render() {
    return this.state?.error ? (
      <View style={{justifyContent: 'center', flex: 1, alignItems: 'center', backgroundColor: colors.purple}}>
        <Text style={{marginHorizontal: 32}}>{this.state.error?.message}</Text>
        <AEButtonRounded
          onPress={() => {
            this.setState({error: null});
          }}>
          {'Retry'}
        </AEButtonRounded>
      </View>
    ) : (
      this.props.children
    );
  }
}
