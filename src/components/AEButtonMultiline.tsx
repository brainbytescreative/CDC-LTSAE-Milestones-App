import React from 'react';
import {Text, TouchableOpacity, TouchableOpacityProps, View, ViewStyle} from 'react-native';

import {colors, sharedStyle} from '../resources/constants';

type Props = Pick<TouchableOpacityProps, 'onPress' | 'disabled'> & {style?: ViewStyle};

const AEButtonMultiline: React.FC<Props> = ({children, onPress, style}) => {
  return (
    <TouchableOpacity accessibilityRole={'button'} onPress={onPress}>
      <View
        style={[
          {
            borderRadius: 10,
            marginHorizontal: 32,
            marginVertical: 16,
            backgroundColor: colors.white,
            padding: 16,
          },
          style,
          sharedStyle.shadow,
        ]}>
        <Text
          style={{
            textTransform: 'none',
            fontFamily: 'Montserrat-Bold',
            fontSize: 18,
            textAlign: 'center',
          }}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AEButtonMultiline;
