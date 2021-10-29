import i18next from 'i18next';
import placeholder from 'lodash/fp/placeholder';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, StyleProp, TouchableOpacity, View, ViewStyle, Platform} from 'react-native';
import DateTimePickerModal, {DateTimePickerProps} from 'react-native-modal-datetime-picker';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';
import {formatDate} from '../utils/helpers';
import AETextInput from './AETextInput';

interface PageProps {
  onPress?: () => void;
  onChange?: (date?: Date) => void;
  label?: string;
  value?: Date;
  mode?: DateTimePickerProps['mode'];
  spanish12HoursClockFormat?: boolean;
  style?: StyleProp<ViewStyle>;
  error?: boolean;
}

const DatePicker: React.FC<PageProps> = ({onChange, label, value, mode = 'date', spanish12HoursClockFormat = false, style, onPress, error}) => {
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
    setDate(dateVal);
    onChange && onChange(dateVal);
    hideDatePicker();
  };

  let dateTimePickerLocale = i18next.language === 'en' ? 'en_US' : 'es';
  if (Platform.OS === 'ios' && i18next.language === 'es' && spanish12HoursClockFormat) {
    dateTimePickerLocale = 'en_US';
  }

  return (
    <>
      <TouchableOpacity accessibilityRole={'button'} onPress={showDatePicker}>
        {/*<AETextInput*/}
        {/*  style={[style, error === true && sharedStyle.errorOutline]}*/}
        {/*  onPress={showDatePicker}*/}
        {/*  editable={false}*/}
        {/*  autoCorrect={false}*/}
        {/*  placeholder={label}*/}
        {/*  value={formatDate(date, mode)}*/}
        {/*/>*/}
        <View
          style={[
            {
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.gray,
              borderRadius: 5,
              paddingHorizontal: 15,
              paddingVertical: 15,
            },
            sharedStyle.shadow,
          ]}>
          <Text style={{color: value ? colors.black : colors.gray}}>{value ? formatDate(date, mode) : label}</Text>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        locale={dateTimePickerLocale}
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
