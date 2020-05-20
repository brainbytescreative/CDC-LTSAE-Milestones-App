import React from 'react';
import {View} from 'react-native';

export default class ErrorBoundary extends React.Component {
  state = {error: null};
  static getDerivedStateFromError(error: Error) {
    return {error};
  }
  componentDidCatch() {
    // log the error to the server
  }
  tryAgain = () => this.setState({error: null});
  render() {
    return this.state.error ? <View>{'There was an error.'}</View> : this.props.children;
  }
}
