import i18next from 'i18next';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, ViewStyle} from 'react-native';
import DateTimePickerModal, {DateTimePickerProps} from 'react-native-modal-datetime-picker';

import {sharedStyle} from '../resources/constants';
import {formatDate} from '../utils/helpers';
import AETextInput from './AETextInput';

interface PageProps {
  onPress?: () => void;
  onChange?: (date?: Date) => void;
  label?: string;
  value?: Date;
  mode?: DateTimePickerProps['mode'];
  style?: StyleProp<ViewStyle>;
  error?: boolean;
}

const DatePicker: React.FC<PageProps> = ({onChange, label, value, mode = 'date', style, onPress, error}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const {t} = useTranslation();

  useEffect(() => setDate(value), [value]);

  const showDatePicker = () => {
    setModalVisible(true);
    onPress?.();
  };

  const hideDatePicker = () => {
    setModalVisible(false);
  };

  const handleConfirm = (dateVal: Date) => {
    hideDatePicker();
    setDate(dateVal);
    onChange && onChange(dateVal);
  };

  return (
    <>
      <AETextInput
        style={[style, error === true && sharedStyle.errorOutline]}
        onPress={showDatePicker}
        editable={false}
        autoCorrect={false}
        placeholder={label}
        value={formatDate(date, mode)}
      />
      <DateTimePickerModal
        locale={i18next.language === 'en' ? 'en_US' : 'es'}
        isVisible={modalVisible}
        date={date ?? new Date()}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        cancelTextIOS={t('common:cancel')}
        confirmTextIOS={t('common:done')}
        headerTextIOS={label}
      />
    </>
  );
};

export default DatePicker;
