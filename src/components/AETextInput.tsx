import React from 'react';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';
import {colors} from '../resources/constants';
import _ from 'lodash';

interface Props extends TextInputProps {
  rightIcon?: any;
}

const AETextInput: React.FC<Props> = (props) => {
  const inputProps = _.omit(props, ['rightIcon']);
  return (
    <View style={styles.container}>
      <TextInput allowFontScaling={true} {...inputProps} style={styles.input} />
      {props.rightIcon}
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
    maxWidth: '90%',
    flexGrow: 1,
    height: '100%',
    fontSize: 15,
    // borderWidth: 1,
  },
});

export default AETextInput;
