import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';
import {trackTopCancel, trackTopDone} from '../utils/analytics';

interface Props {
  onCancel?: () => void;
  onDone?: () => void;
  disabled?: boolean;
}

const CancelDoneTopControl: React.FC<Props> = ({onCancel, onDone, disabled = false}) => {
  const {t} = useTranslation();
  return (
    <View
      onLayout={(event) => console.log(event.nativeEvent.layout.height)}
      style={{flexDirection: 'row', marginHorizontal: 32, marginVertical: 10}}>
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
      {Boolean(onDone) && (
        <TouchableOpacity
          disabled={disabled}
          accessibilityRole={'button'}
          onPress={() => {
            onDone?.();
            trackTopDone();
          }}
          style={{flexGrow: 1, alignItems: 'flex-end'}}>
          <Text style={[sharedStyle.regularText, {color: disabled ? colors.gray : colors.black}]}>
            {t('common:done')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CancelDoneTopControl;
