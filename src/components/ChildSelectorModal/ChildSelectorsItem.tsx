import React from 'react';
import {useTranslation} from 'react-i18next';
import {ChildResult, useGetCurrentChild} from '../../hooks/childrenHooks';
import {colors, sharedStyle} from '../../resources/constants';
import {Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {Text} from 'react-native-paper';
import {formatAge} from '../../utils/helpers';
import BabyPlaceholder from '../Svg/BabyPlaceholder';

interface ItemProps extends ChildResult {
  onSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ChildSelectorsItem: React.FC<ItemProps> = ({id, name, birthday, photo, onDelete, onEdit, onSelect}) => {
  const {t} = useTranslation('childSelector');
  const {data: {id: currentId} = {}} = useGetCurrentChild();
  const selected = currentId === id;
  const selectedStyle = selected && [{backgroundColor: colors.lightGreen, borderRadius: 10}, sharedStyle.shadow];
  const onSelectPress = () => {
    onSelect(id);
  };
  return (
    <TouchableOpacity
      accessible={false}
      onPress={onSelectPress}
      style={[
        {flexDirection: 'row', height: 81, alignItems: 'center'},
        !selected && {borderBottomWidth: 0.5, borderColor: colors.gray},
        selectedStyle,
      ]}>
      <View accessible={false} style={{margin: 16}}>
        <TouchableWithoutFeedback
          accessibilityLabel={t('accessibility:selectChildButton')}
          accessibilityRole={'button'}
          onPress={onSelectPress}>
          {photo ? (
            <Image accessibilityRole={'image'} source={{uri: photo}} style={styles.photo} />
          ) : (
            <View
              style={[
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                styles.photo,
                sharedStyle.shadow,
              ]}>
              <BabyPlaceholder color={colors.purple} width={'80%'} height={'80%'} />
            </View>
          )}
        </TouchableWithoutFeedback>
      </View>
      <View style={{flexGrow: 1, justifyContent: 'center', width: 0}}>
        <Text numberOfLines={1} style={styles.childNameText}>
          {name}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 3}}>
          <Text style={{fontSize: 12}}>{formatAge(birthday)}</Text>
          <View style={{flexDirection: 'row', marginRight: 16}}>
            <TouchableOpacity
              accessibilityRole={'button'}
              onPress={() => {
                onEdit(id);
              }}>
              <Text style={{textDecorationLine: 'underline'}}>{t('edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole={'button'}
              onPress={() => {
                onDelete(id);
              }}
              style={{marginLeft: 16}}>
              <Text style={{textDecorationLine: 'underline'}}>{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  photo: {
    width: 42,
    height: 42,
    borderWidth: 0.3,
    borderColor: 'gray',
    borderRadius: 100,
    backgroundColor: colors.white,
  },
  childNameText: {
    fontSize: 18,
    flexGrow: 0,
    fontFamily: 'Montserrat-Bold',
    // width: 0,
  },
});

export default ChildSelectorsItem;
