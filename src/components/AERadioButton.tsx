import React, {useState} from 'react';
import {StyleProp, TextStyle, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import Svg, {Circle, G, SvgProps} from 'react-native-svg';

import {colors, sharedStyle} from '../resources/constants';

interface Props {
  title?: string;
  value?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  onChange?: (value: boolean) => void;
}

const AERadioButton: React.FC<SvgProps & Props> = ({title, titleStyle, onChange, value, ...props}) => {
  const [state, setState] = useState(false);

  const actualState = value || state;

  return (
    <TouchableOpacity
      accessibilityRole={'radio'}
      accessibilityState={{selected: value}}
      onPress={() => {
        setState(!actualState);
        onChange && onChange(!actualState);
      }}
      style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
      <>
        <View>
          <Svg
            style={[sharedStyle.shadow, {borderRadius: 50}]}
            width="19px"
            height="19px"
            viewBox="0 0 19 19"
            {...props}>
            {value ? (
              <G transform="translate(1 1)" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                <Circle fill="#FFF" fillRule="nonzero" cx={9.5} cy={9.5} r={9.5} />
                <Circle stroke="#B9B9B9" strokeWidth={0.5} fill="#FFF" cx={9.25} cy={9.25} r={9.25} />
                <Circle fill={colors.purple} cx={9.3} cy={9.1} r={5} />
              </G>
            ) : (
              <G fill="#FFF" stroke="none" strokeWidth={1} fillRule="evenodd">
                <Circle fillRule="nonzero" cx={9.5} cy={9.5} r={9.5} />
                <Circle stroke="#B9B9B9" strokeWidth={0.5} cx={9.5} cy={9.5} r={9.25} />
              </G>
            )}
          </Svg>
        </View>
        {title && (
          <View style={{height: 20, justifyContent: 'center'}}>
            <Text style={[{marginLeft: 10, fontSize: 15}, titleStyle]}>{title}</Text>
          </View>
        )}
      </>
    </TouchableOpacity>
  );
};

export default AERadioButton;
