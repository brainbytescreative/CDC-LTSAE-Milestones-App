import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';

const ChildSectorFooter: React.FC<{onPress: () => void}> = ({onPress}) => {
  const {t} = useTranslation('childSelector');
  return (
    <TouchableOpacity onPress={onPress} style={{}}>
      <Text style={{textAlign: 'center', fontSize: 18, margin: 16, fontFamily: 'Montserrat-Bold'}}>
        {t('addChild')}
      </Text>
    </TouchableOpacity>
  );
};

export default ChildSectorFooter;
