import {Text as PaperText} from 'react-native-paper';

import React from 'react';
import {StyleProp, TextStyle} from 'react-native';

interface Props {
  style?: StyleProp<TextStyle>;
}

const Text: React.FC<Props> = ({children, style}) => {
  return (
    <PaperText style={[style, {fontFamily: 'montserrat'}]}>
      {children}
    </PaperText>
  );
};

export default Text;
