import React from 'react';
import {Platform, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View} from 'react-native';
import {colors, sharedStyle} from '../resources/constants';
import _ from 'lodash';
import TouchableArea from './TouchableArea/TouchableArea';

interface Props extends TextInputProps {
  rightIcon?: any;
  onPress?: () => void;
}

const TouchableWrapper: React.FC<{onPress?: () => void}> = ({children, onPress}) => {
  return onPress ? <TouchableArea onPress={onPress}>{children}</TouchableArea> : <>{children}</>;
};

const AETextInput: React.FC<Props> = (props) => {
  const inputProps = _.omit(props, ['rightIcon']);
  return (
    <View
      style={Platform.select({
        default: {},
        ios: [sharedStyle.shadow, {borderRadius: 5}],
      })}>
      <TouchableWrapper onPress={props.onPress}>
        <View style={[styles.container, sharedStyle.shadow]}>
          <TextInput allowFontScaling={true} {...inputProps} style={styles.input} />
          {props.rightIcon}
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
    height: 49,
    borderColor: colors.gray,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  input: {
    flexGrow: 1,
    height: '100%',
    fontSize: 15,
    // borderWidth: 1,
  },
});

export default AETextInput;
