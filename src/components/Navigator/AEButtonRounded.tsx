import React from 'react';
import {Button} from 'react-native-paper';
import {ViewStyle} from 'react-native';
import {sharedStyle} from '../../resources/constants';

type Created = React.ComponentProps<typeof Button>;

interface Props {
  style?: ViewStyle;
}

const AEButtonRounded: React.FC<Created & Props> = ({children, style, ...rest}) => {
  return (
    <Button
      contentStyle={[
        {
          height: 60,
          backgroundColor: 'white',
          borderRadius: 10,
        },
      ]}
      labelStyle={{
        textTransform: 'capitalize',
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
      }}
      style={[{marginHorizontal: 32, marginVertical: 16}, style, sharedStyle.shadow]}
      {...rest}>
      {children}
    </Button>
  );
};

export default AEButtonRounded;
