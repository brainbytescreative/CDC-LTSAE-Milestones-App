import React, {useState} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';
import {TextInput} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {format} from 'date-fns';

interface PageProps {
  onChange?: (date?: Date) => void;
  label?: string;
}

const DatePicker: React.FC<PageProps> = ({onChange, label}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const showDatePicker = () => {
    setModalVisible(true);
  };

  const hideDatePicker = () => {
    setModalVisible(false);
  };

  const handleConfirm = (dateVal: Date) => {
    setDate(dateVal);
    onChange && onChange(dateVal);
    hideDatePicker();
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={showDatePicker}>
        <TextInput
          style={{marginTop: 10}}
          autoCorrect={false}
          // onChange={formik.handleChange('dateOfBirth') as any}
          label={label}
          value={date && format(date, 'MM/dd/yyyy')}
          mode={'outlined'}
          onFocus={() => {
            Keyboard.dismiss();
            setModalVisible(true);
          }}
        />
      </TouchableWithoutFeedback>
      <DateTimePickerModal
        isVisible={modalVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

export default DatePicker;
