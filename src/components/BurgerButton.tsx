import {DrawerActions, useNavigation} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';

import {trackSelectByType} from '../utils/analytics';
import BurgerIcon from './Svg/BurgerIcon';

const BurgerButton: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      accessibilityRole={'menu'}
      accessibilityLabel={t('accessibility:mainMenuButton')}
      hitSlop={{top: 30, bottom: 20, left: 10, right: 10}}
      onPress={() => {
        trackSelectByType('Menu');
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
      style={{paddingHorizontal: 32, paddingVertical: 32}}>
      <BurgerIcon />
    </TouchableOpacity>
  );
};

export default BurgerButton;
