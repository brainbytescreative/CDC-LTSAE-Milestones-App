import React from 'react';
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {LangCode, useChangeLanguage, useGetLanguageCode} from '../resources/l18n';
import {colors, sharedStyle} from '../resources/constants';
import {Text} from 'react-native-paper';

interface Props {
  style?: StyleProp<ViewStyle>;
  title?: string;
  onLanguageChange?: (language: LangCode) => void;
}

const LanguageSelector: React.FC<Props> = ({style, title, onLanguageChange}) => {
  const changeLanguage = useChangeLanguage();
  const {data: lngCode} = useGetLanguageCode();
  return (
    <View style={[{backgroundColor: colors.white, borderRadius: 10}, style]}>
      {title && (
        <Text style={{marginBottom: 20, fontSize: 22, textAlign: 'center', fontFamily: 'Montserrat-Bold'}}>
          {title}
        </Text>
      )}
      <View style={[styles.buttonsContainer, sharedStyle.shadow]}>
        <TouchableOpacity
          style={[
            styles.switchContainer,
            lngCode === 'en' && [styles.switchContainerSel, styles.switchContainerSelLeft],
          ]}
          onPress={() => {
            changeLanguage('en');
            onLanguageChange && onLanguageChange('en');
          }}>
          <Text style={styles.btnText}>{'English'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchContainer,
            lngCode === 'es' && [styles.switchContainerSel, styles.switchContainerSelRight],
          ]}
          onPress={() => {
            changeLanguage('es');
            onLanguageChange && onLanguageChange('es');
          }}>
          <Text style={styles.btnText}>{'Español'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    justifyContent: 'center',
    height: 47,
    flex: 1,
  },
  btnText: {
    textAlign: 'center',
  },
  switchContainerSel: {
    backgroundColor: colors.yellow,
    borderRadius: 10,
  },
  switchContainerSelLeft: {
    borderRightWidth: 0.5,
    borderRightColor: colors.gray,
  },
  switchContainerSelRight: {
    borderLeftWidth: 0.5,
    borderLeftColor: colors.gray,
  },
  buttonsContainer: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: colors.gray,
  },
});

export default LanguageSelector;
