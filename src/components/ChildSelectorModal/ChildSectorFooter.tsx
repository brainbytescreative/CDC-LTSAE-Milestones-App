import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View} from 'react-native';
import Text from '../Text';

const ChildSectorFooter: React.FC<{onPress: () => void}> = ({onPress}) => {
  const {t} = useTranslation('childSelector');
  return (
    <TouchableOpacity onPress={onPress} style={{}}>
      <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold', margin: 16}}>{t('addChild')}</Text>
    </TouchableOpacity>
  );
};

export default ChildSectorFooter;
