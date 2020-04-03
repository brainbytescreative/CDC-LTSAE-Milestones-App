import React, {useEffect, useState} from 'react';

import {TextInput} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface PageProps {
  onChange?: (date?: Date) => void;
  label?: string;
  value?: Date;
}

const DatePicker: React.FC<PageProps> = ({onChange, label, value}) => {
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
        date={date}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

export default DatePicker;
