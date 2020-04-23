import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, TextInput as TextInputNative, View, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {colors, Guardian, StateCode} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import {TextInput} from 'react-native-paper';
import GuardianDialog from './GuardianDialog';
import TerritorySelector from '../TerritorySelector';
import TouchableArea from './TouchableArea/TouchableArea';
import {ChevronDown} from '../resources/svg';
import AETextInput from './AETextInput';

export interface ParentProfileSelectorValues {
  territory: StateCode | undefined;
  guardian: Guardian | undefined;
}

interface Props {
  onChange: (values: ParentProfileSelectorValues) => void;
  value?: ParentProfileSelectorValues | null | undefined;
  style?: ViewStyle;
}

const ParentProfileSelector: React.FC<Props> = ({onChange, value, style}) => {
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
    <View style={[style]}>
      <GuardianDialog value={guardian} onChange={(val) => setGuardian(val)}>
        {(showDialog) => (
          <AETextInput
            onPress={showDialog}
            rightIcon={<ChevronDown />}
            editable={false}
            value={guardianTranslated}
            placeholder={t('fields:guardianPlaceholder')}
          />
        )}
      </GuardianDialog>
      <View style={{height: 10}} />
      <TerritorySelector onChange={(code) => setTerritory(code)}>
        {(showModal) => (
          <AETextInput
            onPress={showModal}
            rightIcon={<ChevronDown />}
            editable={false}
            value={territory ? t(`states:${territory}`) : ''}
            placeholder={t('fields:territoryPlaceholder')}
          />
        )}
      </TerritorySelector>
    </View>
  );
};

export default ParentProfileSelector;
