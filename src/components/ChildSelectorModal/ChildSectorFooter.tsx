import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {Title} from 'react-native-paper';

const ChildSectorFooter: React.FC<{onPress: () => void}> = ({onPress}) => {
  const {t} = useTranslation('childSelector');
  return (
    <TouchableOpacity onPress={onPress} style={{}}>
      <Title style={{textAlign: 'center', fontSize: 18, margin: 16}}>{t('addChild')}</Title>
    </TouchableOpacity>
  );
};

export default ChildSectorFooter;
