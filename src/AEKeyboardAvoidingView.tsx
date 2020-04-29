import React from 'react';
import {KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform} from 'react-native';

const AEKeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({children, ...props}) => {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}} {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};

export default AEKeyboardAvoidingView;
