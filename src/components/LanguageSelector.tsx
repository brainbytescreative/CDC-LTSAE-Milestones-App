import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useChangeLanguage, useGetLanguageCode} from '../resources/l18n';

const languages = ['en', 'es'];

const styles = StyleSheet.create({
  lngSelected: {
    backgroundColor: 'gray',
    color: 'white',
    borderWidth: 0,
    borderRadius: 10,
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: 120,
    textAlign: 'center',
    overflow: 'hidden',
  },
  lngDeselected: {
    borderRadius: 10,
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: 120,
    textAlign: 'center',
  },
});

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
        <View style={{borderWidth: 1, flexDirection: 'row', borderRadius: 10}}>
          <TouchableWithoutFeedback
            onPress={() => {
              changeLanguage('en');
            }}>
            <Text
              style={
                lngCode === 'en' ? styles.lngSelected : styles.lngDeselected
              }>
              {'English'}
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              changeLanguage('es');
            }}>
            <Text
              style={
                lngCode === 'es' ? styles.lngSelected : styles.lngDeselected
              }>
              {'Español'}
            </Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
};

export default LanguageSelector;
