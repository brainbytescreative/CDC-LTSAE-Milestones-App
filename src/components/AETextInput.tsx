import React from 'react';
import {Platform, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle} from 'react-native';

import {colors, sharedStyle} from '../resources/constants';
import TouchableArea from './TouchableArea/TouchableArea';

interface Props extends TextInputProps {
  rightIcon?: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const TouchableWrapper: React.FC<{onPress?: () => void}> = ({children, onPress}) => {
  return onPress ? <TouchableArea onPress={onPress}>{children}</TouchableArea> : <>{children}</>;
};

const AETextInput: React.FC<Props> = ({rightIcon, ...props}) => {
  return (
    <View
      style={[
        Platform.select({
          default: {},
          ios: [sharedStyle.shadow, {borderRadius: 5}],
        }),
        props.style,
      ]}>
      <TouchableWrapper onPress={props.onPress}>
        <View style={[styles.container, sharedStyle.shadow]}>
          <TextInput placeholderTextColor={colors.gray} allowFontScaling={true} {...props} style={[styles.input]} />
          {rightIcon}
        </View>
      </TouchableWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 49,
    maxHeight: 100,
    borderColor: colors.gray,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  input: {
    flexGrow: 1,
    height: '100%',
    color: 'black',
    ...sharedStyle.regularText,
    ...Platform.select({
      android: {
        padding: 0,
      },
    }),
    // borderWidth: 1,
  },
});

export default AETextInput;
