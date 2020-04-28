import React from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {BabyPlaceholder} from '../resources/svg';

const ChildPhoto: React.FC<{photo?: string; style?: StyleProp<ViewStyle>}> = ({photo, style}) => {
  return (
    <View style={[{alignItems: 'center', marginTop: 16, marginBottom: 25}, style]}>
      <View style={styles.image}>
        {photo ? (
          <Image style={{width: '100%', height: '100%', borderRadius: 500}} source={{uri: photo}} />
        ) : (
          <BabyPlaceholder width={'90%'} height={'90%'} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: 190,
    height: 190,
    borderRadius: 190,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});

export default ChildPhoto;
