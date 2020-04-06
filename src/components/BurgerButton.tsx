import React from 'react';
import {TouchableOpacity} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {BurgerIcon} from '../resources/svg';

const BurgerButton: React.FC<{}> = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.dispatch(DrawerActions.toggleDrawer());
      }}
      style={{paddingHorizontal: 32}}>
      <BurgerIcon />
    </TouchableOpacity>
  );
};

export default BurgerButton;
