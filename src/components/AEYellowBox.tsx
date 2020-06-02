import React from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {colors, sharedStyle} from '../resources/constants';
import {Text} from 'react-native-paper';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const AEYellowBox: React.FC<Props> = ({children, containerStyle, labelStyle}) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.yellow,
          padding: 5,
          marginHorizontal: 32,
          marginTop: 20,
          marginBottom: 50,
          borderRadius: 10,
        },
        sharedStyle.shadow,
        containerStyle,
      ]}>
      <Text
        style={[
          {
            textAlign: 'center',
            fontSize: 15,
          },
          labelStyle,
        ]}>
        {children}
      </Text>
    </View>
  );
};

export default AEYellowBox;
