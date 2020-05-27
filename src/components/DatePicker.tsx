import React, {useEffect, useState} from 'react';
import DateTimePickerModal, {DateTimePickerProps} from 'react-native-modal-datetime-picker';
import {StyleProp, ViewStyle} from 'react-native';
import {formatDate} from '../utils/helpers';
import AETextInput from './AETextInput';

interface PageProps {
  onChange?: (date?: Date) => void;
  label?: string;
  value?: Date;
  mode?: DateTimePickerProps['mode'];
  style?: StyleProp<ViewStyle>;
}

const DatePicker: React.FC<PageProps> = ({onChange, label, value, mode = 'date', style}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => setDate(value), [value]);

  const showDatePicker = () => {
    setModalVisible(true);
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
        date={date}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

export default DatePicker;
