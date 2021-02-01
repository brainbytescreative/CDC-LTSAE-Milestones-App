import React from 'react';
import {StyleProp, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';
import Svg, {G, Rect} from 'react-native-svg';

type Props = {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  onText?: string;
  offText?: string;
} & Pick<TouchableWithoutFeedbackProps, 'accessibilityState' | 'accessibilityLabel' | 'accessibilityRole'>;

const AESwitch: React.FC<Props> = ({
  accessibilityLabel,
  accessibilityState,
  accessibilityRole,
  value,
  onValueChange,
  style,
  onText,
  offText,
}) => (
  <TouchableWithoutFeedback
    accessibilityState={accessibilityState}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    onPress={() => {
      onValueChange && onValueChange(!value);
    }}>
    <View style={[{flexDirection: 'row', alignItems: 'center'}, style]}>
      {value ? (
        <Svg width="31px" height="17px" viewBox="0 0 31 17">
          <G fillRule="nonzero" stroke="none" strokeWidth={1} fill="none">
            <Rect
              x={0}
              y={0}
              width={31}
              height={17}
              rx={8.5}
              fill="#FC9554"
              transform="translate(-61 -131) translate(61 131)"
            />
            <Rect
              x={0}
              y={0}
              width={13}
              height={13}
              rx={6.5}
              transform="translate(-61 -131) translate(61 131) translate(15 2)"
              fill="#FFF"
            />
          </G>
        </Svg>
      ) : (
        <Svg width="31px" height="17px" viewBox="0 0 31 17">
          <G fillRule="nonzero" stroke="none" strokeWidth={1} fill="none">
            <Rect
              x={0}
              y={0}
              width={31}
              height={17}
              rx={8.5}
              fill="#B9B9B9"
              transform="translate(-134 -59) translate(134 59)"
            />
            <Rect
              x={0}
              y={0}
              width={13}
              height={13}
              rx={6.5}
              transform="translate(-134 -59) translate(134 59) translate(3 2)"
              fill="#FFF"
            />
          </G>
        </Svg>
      )}
      {onText && offText && <Text style={{marginLeft: 10, fontSize: 12}}>{value ? onText : offText}</Text>}
    </View>
  </TouchableWithoutFeedback>
);

export default AESwitch;
