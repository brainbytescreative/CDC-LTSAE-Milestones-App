import React from 'react';
import {View} from 'react-native';

import {colors} from '../resources/constants';

const FullScreenLoading: React.FC = () => {
  return (
    <View style={{justifyContent: 'center', flex: 1, backgroundColor: colors.white}}>
      {/*<ActivityIndicator color={colors.white} size={'large'} />*/}
    </View>
  );
};

export default FullScreenLoading;
