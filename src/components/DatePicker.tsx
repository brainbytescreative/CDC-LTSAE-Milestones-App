import React, {useEffect, useState} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import DateTimePickerModal, {DateTimePickerProps} from 'react-native-modal-datetime-picker';

import {formatDate} from '../utils/helpers';
import AETextInput from './AETextInput';

interface PageProps {
  onPress?: () => void;
  onChange?: (date?: Date) => void;
  label?: string;
  value?: Date;
  mode?: DateTimePickerProps['mode'];
  style?: StyleProp<ViewStyle>;
}

const DatePicker: React.FC<PageProps> = ({onChange, label, value, mode = 'date', style, onPress}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

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
        style={style}
        onPress={showDatePicker}
        editable={false}
        autoCorrect={false}
        placeholder={label}
        value={formatDate(date, mode)}
      />
      <DateTimePickerModal
        isVisible={modalVisible}
        date={date ?? new Date()}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

export default DatePicker;
