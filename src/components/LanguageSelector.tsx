import React from 'react';
import {StyleProp, Text, View, ViewStyle} from 'react-native';
import SegmentedControlIOS from '@react-native-community/segmented-control';
import {useTranslation} from 'react-i18next';
import {useChangeLanguage, useGetLanguageCode} from '../resources/l18n';

const languages = ['en', 'es'];

const LanguageSelector: React.FC<{style?: StyleProp<ViewStyle>}> = ({
  style,
}) => {
  const {t} = useTranslation();
  const changeLanguage = useChangeLanguage();
  const {data: lngCode} = useGetLanguageCode();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
        },
        style,
      ]}>
      <View style={{padding: 20}}>
        <Text style={{marginBottom: 10, fontSize: 16}}>
          {t('common:appLanguage')}
        </Text>
        {lngCode && (
          <SegmentedControlIOS
            values={['English', 'Español']}
            style={{minWidth: 200}}
            selectedIndex={languages.indexOf(lngCode)}
            onChange={(event) => {
              // this.setState({selectedIndex: event.nativeEvent.selectedSegmentIndex});
              changeLanguage(languages[event.nativeEvent.selectedSegmentIndex]);
            }}
          />
        )}
      </View>
    </View>
  );
};

export default LanguageSelector;
