import i18next from 'i18next';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {colors, sharedStyle} from '../resources/constants';
import {useChangeLanguage} from '../resources/l18n';

interface Props {
  style?: StyleProp<ViewStyle>;
  title?: string;
  onLanguageChange?: (language: string) => void;
}

const LanguageSelector: React.FC<Props> = ({style, title, onLanguageChange}) => {
  const changeLanguage = useChangeLanguage();
  const lngCode = i18next.language;
  const {t} = useTranslation();

  return (
    <View style={[{backgroundColor: colors.white, borderRadius: 10}, style]}>
      {title && (
        <Text style={{marginBottom: 20, fontSize: 22, textAlign: 'center', fontFamily: 'Montserrat-Bold'}}>
          {title}
        </Text>
      )}
      <View style={[styles.buttonsContainer, sharedStyle.shadow]}>
        <TouchableOpacity
          accessibilityRole={'button'}
          accessibilityState={{
            selected: lngCode === 'en',
          }}
          style={[
            styles.switchContainer,
            lngCode === 'en' && [styles.switchContainerSel, styles.switchContainerSelLeft],
          ]}
          onPress={() => {
            changeLanguage('en');
            onLanguageChange && onLanguageChange('en');
          }}>
          <Text style={styles.btnText}>{t('common:english')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityState={{
            selected: lngCode === 'es',
          }}
          accessibilityRole={'button'}
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
