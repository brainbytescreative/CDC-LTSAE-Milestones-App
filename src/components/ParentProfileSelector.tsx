import React, {useEffect, useState} from 'react';
import {Keyboard, StyleSheet, TextInput as TextInputNative, View} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {Guardian, StateCode} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import {TextInput} from 'react-native-paper';
import GuardianDialog from './GuardianDialog';
import TerritorySelector from '../TerritorySelector';

export interface ParentProfileSelectorValues {
  territory: StateCode | undefined;
  guardian: Guardian | undefined;
}

interface Props {
  onChange?: (values: ParentProfileSelectorValues) => void;
}

const ParentProfileSelector: React.FC<Props> = ({onChange}) => {
  const {t} = useTranslation();
  const [territory, setTerritory] = useState<StateCode | undefined>();
  const [guardian, setGuardian] = useState<Guardian | undefined>();

  const guardianTranslated = guardian ? t(`guardianTypes:${guardian}`) : '';

  useEffect(() => {
    if (!!territory || !!guardian) {
      onChange && onChange({territory, guardian});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [territory, guardian]);

  return (
    <>
      <GuardianDialog value={guardian} onChange={(value) => setGuardian(value)}>
        {(showDialog) => (
          <View style={{margin: 10}}>
            <TextInput
              mode={'outlined'}
              onFocus={() => {
                Keyboard.dismiss();
                showDialog();
              }}
              label={t('fields:guardianPlaceholder')}
              value={guardianTranslated}
              render={(props) => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TextInputNative {...props} />
                  <Icon name="chevron-down" size={40} />
                </View>
              )}
            />
          </View>
        )}
      </GuardianDialog>

      <View style={{margin: 10}}>
        <TerritorySelector onChange={(code) => setTerritory(code)}>
          {(showModal) => (
            <TextInput
              mode={'outlined'}
              onFocus={() => {
                Keyboard.dismiss();
                showModal();
              }}
              label={t('fields:territoryPlaceholder')}
              value={territory ? t(`states:${territory}`) : ''}
              render={(props) => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TextInputNative {...props} />
                  <Icon name="chevron-down" size={40} />
                </View>
              )}
            />
          )}
        </TerritorySelector>
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
