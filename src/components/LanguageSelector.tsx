import React from 'react';
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useChangeLanguage, useGetLanguageCode} from '../resources/l18n';
import {colors} from '../resources/constants';
import Text from './Text';

interface Props {
  style?: StyleProp<ViewStyle>;
  title?: string;
}

const LanguageSelector: React.FC<Props> = ({style, title}) => {
  const {t} = useTranslation();
  const changeLanguage = useChangeLanguage();
  const {data: lngCode} = useGetLanguageCode();
  return (
    <View>
      <Text style={{marginBottom: 20, fontSize: 22, fontWeight: 'bold', textAlign: 'center'}}>
        {title || t('common:appLanguage')}
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.switchContainer,
            lngCode === 'en' && [styles.switchContainerSel, styles.switchContainerSelLeft],
          ]}
          onPress={() => {
            changeLanguage('en');
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
    borderWidth: 0.5,
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: colors.gray,
  },
});

export default LanguageSelector;
