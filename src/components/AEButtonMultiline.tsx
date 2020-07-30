import React from 'react';
import {Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';

import {colors, sharedStyle} from '../resources/constants';

type Props = Pick<TouchableOpacityProps, 'onPress'>;

const AEButtonMultiline: React.FC<Props> = ({children, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          {
            borderRadius: 10,
            marginHorizontal: 32,
            marginVertical: 16,
            backgroundColor: colors.white,
            padding: 16,
          },
          sharedStyle.shadow,
        ]}>
        <Text
          style={{
            textTransform: 'capitalize',
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
