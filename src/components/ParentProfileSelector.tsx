import {FastField, FastFieldProps} from 'formik';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';

import {ParentProfileSelectorValues, guardianTypes, sharedStyle, states} from '../resources/constants';
import {trackSelectProfile, trackSelectTerritory} from '../utils/analytics';
import DropDownPicker from './DropDownPicker';
import Chevron from './Svg/Chevron';

// interface Props {
//   // onChange: (values: ParentProfileSelectorValues) => void;
//   // value?: ParentProfileSelectorValues | null | undefined;
//   // style?: ViewStyle;
// }

const ParentProfileSelector: React.FC = () => {
  const {t} = useTranslation();

  return (
    <>
      <FastField name={'guardian'}>
        {({field, form}: FastFieldProps<string | null>) => (
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
            value={field.value}
            zIndex={1100}
            style={[sharedStyle.shadow]}
            onChangeItem={(item) => {
              trackSelectProfile(String(item.label));
              // onChange({guardian: item.value, territory: value?.territory});
              form.setFieldValue(field.name, item.value);
            }}
          />
        )}
      </FastField>
      <View style={{height: 10}} />
      <FastField name={'territory'}>
        {({field, form, meta}: FastFieldProps<ParentProfileSelectorValues['territory']>) => (
          <DropDownPicker
            containerStyle={[meta.error ? sharedStyle.errorOutline : null]}
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
            value={field.value}
            zIndex={1000}
            onChangeItem={(item) => {
              trackSelectTerritory(String(item.label));
              // onChange({guardian: value?.guardian, territory: item.value});
              form.setFieldValue(field.name, item.value);
            }}
          />
        )}
      </FastField>
    </>
  );
};

export default ParentProfileSelector;
