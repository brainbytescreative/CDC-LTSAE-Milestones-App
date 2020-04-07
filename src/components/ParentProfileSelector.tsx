import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, TextInput as TextInputNative, View} from 'react-native';
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
  onChange: (values: ParentProfileSelectorValues) => void;
  value?: ParentProfileSelectorValues | null | undefined;
}

const ParentProfileSelector: React.FC<Props> = ({onChange, value}) => {
  const {t} = useTranslation();
  const [territory, setTerritory] = useState<StateCode | undefined>();
  const [guardian, setGuardian] = useState<Guardian | undefined>();

  useEffect(() => {
    value?.guardian && setGuardian(value.guardian);
    value?.territory && setTerritory(value.territory);
  }, [value]);

  const guardianTranslated = guardian ? t(`guardianTypes:${guardian}`) : '';

  const change = useCallback(onChange, []);

  useEffect(() => {
    if (!!territory || !!guardian) {
      change({territory, guardian});
    }
  }, [territory, guardian, change]);

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

export default ParentProfileSelector;
