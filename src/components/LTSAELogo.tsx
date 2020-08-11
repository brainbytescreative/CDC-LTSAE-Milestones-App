import i18next from 'i18next';
import React from 'react';
import {Image} from 'react-native';

const images: Record<string, any | undefined> = {
  en: require('../resources/images/LTSAE_Logo_en.jpg'),
  es: require('../resources/images/LTSAE_Logo_es.jpg'),
};

const LTSAELogo: React.FC = () => {
  return (
    <Image
      style={{marginLeft: 24, width: 90, height: undefined, aspectRatio: 92 / 69}}
      resizeMode={'contain'}
      source={images[i18next.language]}
    />
  );
};

export default LTSAELogo;
