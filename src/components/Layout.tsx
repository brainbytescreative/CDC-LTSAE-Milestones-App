import React from 'react';
import {
  SafeAreaView,
  StyleProp,
  StyleSheet,
  ViewStyle,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

const Layout: React.FC<{style?: StyleProp<ViewStyle>}> = ({
  children,
  style = {},
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Layout;
