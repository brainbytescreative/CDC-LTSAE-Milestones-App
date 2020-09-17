import React from 'react';
import {StyleProp, TextStyle, View, ViewProps, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
} & Pick<ViewProps, 'onLayout'>;

const AEYellowBox: React.FC<Props> = ({children, containerStyle, labelStyle, onLayout}) => {
  return (
    <View
      onLayout={onLayout}
      style={[
        {
          backgroundColor: colors.yellow,
          paddingVertical: 10,
          paddingHorizontal: 10,
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
