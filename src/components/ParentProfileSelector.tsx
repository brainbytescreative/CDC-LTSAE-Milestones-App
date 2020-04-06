import React, {useEffect, useState} from 'react';
import {Keyboard, StyleSheet, View, TextInput as TextInputNative} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/EvilIcons';
import {states} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import {TextInput} from 'react-native-paper';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

interface ParentProfileSelectorValues {
  territory: string | null;
  guardian: string | null;
}

interface Props {
  onChange?: (values: ParentProfileSelectorValues) => void;
}

const ParentProfileSelector: React.FC<Props> = ({onChange}) => {
  const {t} = useTranslation();
  const [territory, setTerritory] = useState<string | null>(null);
  const [guardian, setGuardian] = useState<string | null>(null);

  useEffect(() => {
    onChange && onChange({territory, guardian});
  }, [territory, guardian, onChange]);

  return (
    <>
      <View style={{margin: 10}}>
        {/*<RNPickerSelect*/}
        {/*  style={pickerSelectStyles}*/}
        {/*  placeholder={{*/}
        {/*    label: t('fields:guardianPlaceholder'),*/}
        {/*    value: null,*/}
        {/*    color: '#9EA0A4',*/}
        {/*  }}*/}
        {/*  value={guardian}*/}
        {/*  Icon={() => <Icon name="chevron-down" size={40} />}*/}
        {/*  onValueChange={(value) => setGuardian(value)}*/}
        {/*  items={guardianTypes.map((value) => ({*/}
        {/*    label: t(`guardianTypes:${value}`),*/}
        {/*    value,*/}
        {/*  }))}*/}
        {/*/>*/}
        <TouchableWithoutFeedback onPress={() => {}}>
          <TextInput
            mode={'outlined'}
            onFocus={() => {
              Keyboard.dismiss();
            }}
            label={t('fields:guardianPlaceholder')}
            value={territory || ''}
            render={(props) => (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TextInputNative {...props} />
                <Icon name="chevron-down" size={40} />
              </View>
            )}
          />
        </TouchableWithoutFeedback>
      </View>
      <View style={{margin: 10}}>
        <RNPickerSelect
          placeholder={{
            label: t('fields:territoryPlaceholder'),
            value: null,
            color: '#9EA0A4',
          }}
          style={pickerSelectStyles}
          value={territory}
          Icon={() => <Icon name="chevron-down" size={40} />}
          onValueChange={(value) => setTerritory(value)}
          items={states.map((value) => ({
            label: t(`states:${value}`),
            value,
          }))}
        />
      </View>
    </>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 5,
    right: 5,
  },
});

export default ParentProfileSelector;
