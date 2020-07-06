import React from 'react';
import {TouchableOpacity} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import BurgerIcon from './Svg/BurgerIcon';
import {useTranslation} from 'react-i18next';

const BurgerButton: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      accessibilityRole={'menu'}
      accessibilityLabel={t('accessibility:mainMenuButton')}
      hitSlop={{top: 30, bottom: 20, left: 10, right: 10}}
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
      style={{paddingHorizontal: 32, paddingVertical: 32}}>
      <BurgerIcon />
    </TouchableOpacity>
  );
};

export default BurgerButton;
