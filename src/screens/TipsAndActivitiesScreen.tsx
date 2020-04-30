import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import SkillTypeDialog from '../components/SkillTypeDialog';
import {colors, LanguageType, sharedStyle, SkillType, skillTypes} from '../resources/constants';
import tipsAndActivities from '../resources/tipsAndActivities';
import i18next, {TFunction} from 'i18next';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useNavigation} from '@react-navigation/native';
import ChildPhoto from '../components/ChildPhoto';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {formatAge} from '../utils/helpers';
import {ChevronDown, PurpleArc} from '../resources/svg';
import LikeHeart from '../resources/svg/LikeHeart';
import ButtonWithChevron from '../components/ButtonWithChevron';

const Item: React.FC<{title: string; t: TFunction}> = ({title, t}) => (
  <View>
    <View
      style={[
        {
          padding: 20,
          paddingBottom: 40,
          marginHorizontal: 32,
          marginTop: 30,
          backgroundColor: colors.white,
        },
        sharedStyle.shadow,
        sharedStyle.border,
      ]}>
      <Text>{title}</Text>
    </View>
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 48,
        marginTop: -25,
        justifyContent: 'space-between',
      }}>
      <TouchableOpacity style={[itemStyle.button, sharedStyle.border, sharedStyle.shadow]}>
        <LikeHeart style={{marginRight: 5}} />
        <Text style={{textTransform: 'capitalize'}}>{t('like')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[itemStyle.button, sharedStyle.border, sharedStyle.shadow]}>
        <Text style={{textTransform: 'capitalize'}}>{t('remindMe')}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const itemStyle = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const TipsAndActivitiesScreen: React.FC<{}> = () => {
  const {t} = useTranslation('tipsAndActivities');
  const navigation = useNavigation();
  const [skillType, setSkillType] = useState<string>('All');
  const {data: child} = useGetCurrentChild();

  const onPressNextSection = () => {
    const currentSection = skillTypes.indexOf(skillType);
    if (currentSection < skillTypes.length - 1) {
      setSkillType(skillTypes[currentSection + 1]);
    } else {
      setSkillType(skillTypes[0]);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.iceCold,
      },
    });
  }, [navigation]);

  const tips = tipsAndActivities
    .filter((value) => value.age === '2-hint')
    .map((value) => value[i18next.language as LanguageType]);

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <FlatList
        data={tips}
        ListHeaderComponent={() => (
          <>
            <ChildSelectorModal />
            <ChildPhoto photo={child?.photo} />
            <Text style={{textAlign: 'center', fontSize: 22, fontFamily: 'Montserrat-Bold'}}>{t('title')}</Text>
            <Text style={{textAlign: 'center', fontSize: 15, marginTop: 20, marginHorizontal: 50}}>
              {t('subtitle', {
                childAge: formatAge(child?.birthday),
              })}
            </Text>

            <SkillTypeDialog
              onChange={(value) => {
                value && setSkillType(value);
              }}
              value={skillType}>
              {(showDialog) => (
                <View
                  style={[
                    {
                      marginTop: 30,
                      backgroundColor: colors.iceCold,
                      marginHorizontal: 32,
                      paddingHorizontal: 16,
                      paddingVertical: 11,
                    },
                    sharedStyle.border,
                    sharedStyle.shadow,
                  ]}>
                  <TouchableOpacity
                    onPress={showDialog}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18}}>{t(`skillTypes:${skillType}`)}</Text>
                    <ChevronDown />
                  </TouchableOpacity>
                </View>
              )}
            </SkillTypeDialog>
          </>
        )}
        ListFooterComponent={() => (
          <View style={{marginTop: 47}}>
            <PurpleArc width={'100%'} />
            <View style={{backgroundColor: colors.purple}}>
              <ButtonWithChevron onPress={onPressNextSection}>{t('nextSection')}</ButtonWithChevron>
            </View>
          </View>
        )}
        renderItem={({item}) => <Item t={t} title={item} />}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  );
};

export default TipsAndActivitiesScreen;
