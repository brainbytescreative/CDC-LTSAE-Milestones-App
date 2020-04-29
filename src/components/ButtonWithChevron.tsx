import React from 'react';
import {StyleProp, Text, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View, ViewStyle} from 'react-native';
import {colors, sharedStyle} from '../resources/constants';
import ChevronRightBig from '../resources/svg/ChevronRightBig';

interface Props extends TouchableWithoutFeedbackProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const ButtonWithChevron: React.FC<Props> = ({children, containerStyle, ...props}) => {
  return (
    <TouchableWithoutFeedback {...props}>
      <View
        style={[
          {
            backgroundColor: colors.white,
            margin: 32,
            borderRadius: 10,
            flexDirection: 'row',
            paddingRight: 16,
            height: 60,
            alignItems: 'center',
          },
          sharedStyle.shadow,
          containerStyle,
        ]}>
        <Text
          style={{
            flexGrow: 1,
            textAlign: 'center',
            fontFamily: 'Montserrat-Bold',
            textTransform: 'capitalize',
          }}>
          {children}
        </Text>
        <ChevronRightBig width={10} height={20} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ButtonWithChevron;
