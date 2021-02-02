import React from 'react';
import {StyleProp, TextStyle, View, ViewProps, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  wrapper?: 'text' | 'none';
} & Pick<ViewProps, 'onLayout'>;

const AEYellowBox: React.FC<Props> = ({wrapper = 'text', children, containerStyle, labelStyle, onLayout}) => {
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
      {wrapper === 'text' ? (
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
      ) : (
        children
      )}
    </View>
  );
};

export default AEYellowBox;
