import React from 'react';
import {View, ViewStyle} from 'react-native';
import {sharedStyle, states} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import {ChevronDown} from '../resources/svg';
import DropDownPicker from './DropDownPicker';

export interface ParentProfileSelectorValues {
  territory: string | undefined | null;
  guardian: string | undefined | null;
}

interface Props {
  onChange: (values: ParentProfileSelectorValues) => void;
  value?: ParentProfileSelectorValues | null | undefined;
  style?: ViewStyle;
}

const guardianTypes = ['guardian', 'healthcareProvider'];

const ParentProfileSelector: React.FC<Props> = ({onChange, value, style}) => {
  const {t} = useTranslation();

  return (
    <>
      <DropDownPicker
        labelStyle={[sharedStyle.regularText, {flexGrow: 1}]}
        placeholder={t('fields:guardianPlaceholder')}
        items={guardianTypes.map((val) => ({
          label: t(`guardianTypes:${val}`),
          value: val,
        }))}
        customArrowDown={<ChevronDown direction={'up'} />}
        customArrowUp={<ChevronDown />}
        defaultNull
        value={value?.guardian}
        zIndex={11000}
        style={[sharedStyle.shadow, sharedStyle.border]}
        onChangeItem={(item) => {
          onChange({guardian: item.value, territory: value?.territory});
        }}
      />
      <View style={{height: 10}} />
      <DropDownPicker
        customArrowDown={<ChevronDown direction={'up'} />}
        customArrowUp={<ChevronDown />}
        labelStyle={[sharedStyle.regularText, {flexGrow: 1}]}
        style={[sharedStyle.shadow, sharedStyle.border]}
        placeholder={t('fields:territoryPlaceholder')}
        items={states.map((val) => ({
          label: t(`states:${val}`),
          value: val,
        }))}
        defaultNull
        value={value?.territory}
        zIndex={10000}
        onChangeItem={(item) => onChange({guardian: value?.guardian, territory: item.value})}
      />
    </>
  );
};

export default ParentProfileSelector;
