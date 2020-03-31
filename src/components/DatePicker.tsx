import React, {useState} from 'react';
import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';

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
    hideDatePicker();
    setDate(dateVal);
    onChange && onChange(dateVal);
  };

  const {t} = useTranslation();

  return (
    <>
      <TouchableOpacity onPress={showDatePicker}>
        <TextInput
          editable={false}
          style={{marginTop: 10}}
          autoCorrect={false}
          // onChange={formik.handleChange('dateOfBirth') as any}
          label={label}
          value={(date && format(date, t('common:dateFormat'))) || ''}
          mode={'outlined'}
        />
      </TouchableOpacity>
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
