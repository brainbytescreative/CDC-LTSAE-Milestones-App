import React from 'react';
import {View} from 'react-native';
import {sharedStyle, states} from '../resources/constants';
import {useTranslation} from 'react-i18next';
import DropDownPicker from './DropDownPicker';
import Chevron from './Svg/Chevron';

export interface ParentProfileSelectorValues {
  territory: string | undefined | null;
  guardian: string | undefined | null;
}

interface Props {
  onChange: (values: ParentProfileSelectorValues) => void;
  value?: ParentProfileSelectorValues | null | undefined;
  // style?: ViewStyle;
}

const guardianTypes = ['guardian', 'healthcareProvider'];

const ParentProfileSelector: React.FC<Props> = ({onChange, value}) => {
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
        customArrowDown={<Chevron direction={'up'} />}
        customArrowUp={<Chevron direction={'down'} />}
        defaultNull
        value={value?.guardian}
        zIndex={1100}
        style={[sharedStyle.shadow]}
        onChangeItem={(item) => {
          onChange({guardian: item.value, territory: value?.territory});
        }}
      />
      <View style={{height: 10}} />
      <DropDownPicker
        customArrowDown={<Chevron direction={'up'} />}
        customArrowUp={<Chevron direction={'down'} />}
        labelStyle={[sharedStyle.regularText, {flexGrow: 1}]}
        style={[sharedStyle.shadow]}
        placeholder={t('fields:territoryPlaceholder')}
        items={states.map((val) => ({
          label: t(`states:${val}`),
          value: val,
        }))}
        defaultNull
        dropDownMaxHeight={140}
        value={value?.territory}
        zIndex={1000}
        onChangeItem={(item) => onChange({guardian: value?.guardian, territory: item.value})}
      />
    </>
  );
};

export default ParentProfileSelector;
