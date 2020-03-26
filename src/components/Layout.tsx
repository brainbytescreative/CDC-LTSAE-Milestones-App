import React from 'react';
import {SafeAreaView, StyleProp, StyleSheet, ViewStyle} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const Layout: React.FC<{style?: StyleProp<ViewStyle>}> = ({
  children,
  style = {},
}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
};

export default Layout;
