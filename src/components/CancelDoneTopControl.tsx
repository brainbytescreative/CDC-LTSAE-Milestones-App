import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {sharedStyle} from '../resources/constants';
import {trackTopCancel, trackTopDone} from '../utils/analytics';

interface Props {
  onCancel?: () => void;
  onDone?: () => void;
}

const CancelDoneTopControl: React.FC<Props> = ({onCancel, onDone}) => {
  const {t} = useTranslation();
  return (
    <View style={{flexDirection: 'row', marginHorizontal: 32, marginVertical: 10}}>
      {Boolean(onCancel) && (
        <TouchableOpacity
          accessibilityRole={'button'}
          onPress={() => {
            onCancel?.();
            trackTopCancel();
          }}
          style={{flexGrow: 1}}>
          <Text style={[sharedStyle.regularText]}>{t('common:cancel')}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        accessibilityRole={'button'}
        onPress={() => {
          onDone?.();
          trackTopDone();
        }}
        style={{flexGrow: 1, alignItems: 'flex-end'}}>
        <Text style={[sharedStyle.regularText]}>{t('common:done')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CancelDoneTopControl;
