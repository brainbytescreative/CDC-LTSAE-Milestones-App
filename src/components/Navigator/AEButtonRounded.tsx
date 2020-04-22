import React from 'react';
import {Button} from 'react-native-paper';

type Created = React.ComponentProps<typeof Button>;
const AEButtonRounded: React.FC<Created> = ({children, ...rest}) => {
  return (
    <Button
      contentStyle={{
        height: 60,
        backgroundColor: 'white',
        borderRadius: 10,
      }}
      labelStyle={{
        textTransform: 'capitalize',
        fontWeight: 'bold',
        fontSize: 18,
      }}
      style={{marginHorizontal: 32, marginVertical: 16}}
      {...rest}>
      {children}
    </Button>
  );
};

export default AEButtonRounded;
