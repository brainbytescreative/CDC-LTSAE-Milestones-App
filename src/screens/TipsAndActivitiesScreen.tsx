import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import SkillTypeDialog from '../components/SkillTypeDialog';
import {colors, sharedStyle} from '../resources/constants';
import {TFunction} from 'i18next';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useNavigation} from '@react-navigation/native';
import ChildPhoto from '../components/ChildPhoto';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {formatAge} from '../utils/helpers';
import {ChevronDown} from '../resources/svg';
import LikeHeart from '../resources/svg/LikeHeart';
import {Tip, useGetTipValue, useGetTips, useSetTip} from '../hooks/checklistHooks';

type ItemProps = {
  title: string | undefined;
  t: TFunction;
  itemId: number | undefined;
  onLikePress?: (id: number | undefined, value: boolean) => void;
  onRemindMePress?: (id: number | undefined, value: boolean) => void;
  childId?: number;
} & Tip;

const Item: React.FC<ItemProps> = ({title, t, itemId, onLikePress, childId, onRemindMePress}) => {
  const {data: {like, remindMe} = {}} = useGetTipValue({hintId: itemId, childId});

  return (
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
        <View
          style={[
            itemStyle.button,
            sharedStyle.border,
            sharedStyle.shadow,
            !!like && {backgroundColor: colors.purple},
          ]}>
          <TouchableOpacity style={itemStyle.buttonTouchable} onPress={() => onLikePress && onLikePress(itemId, !like)}>
            <LikeHeart selected={!!like} style={{marginRight: 5}} />
            <Text style={{textTransform: 'capitalize'}}>{t('like')}</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            itemStyle.button,
            sharedStyle.border,
            sharedStyle.shadow,
            !!remindMe && {backgroundColor: colors.purple},
          ]}>
          <TouchableOpacity
            style={itemStyle.buttonTouchable}
            onPress={() => {
              onRemindMePress && onRemindMePress(itemId, !remindMe);
            }}>
            <Text style={{textTransform: 'capitalize'}}>{t('remindMe')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const itemStyle = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
});

const TipsAndActivitiesScreen: React.FC<{}> = () => {
  const {t} = useTranslation('tipsAndActivities');
  const navigation = useNavigation();
  const [skillType, setSkillType] = useState<string>('All');
  const {data: child} = useGetCurrentChild();
  const {data: tips} = useGetTips();
  const [setTip] = useSetTip();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.iceCold,
      },
    });
  }, [navigation]);

  // const {data: {milestoneAge} = {}} = useGetMilestone();
  // console.log(tipsData);

  // const tips = useMemo(
  //   () =>
  //     milestoneChecklist
  //       .filter((value) => value.id === milestoneAge)[0]
  //       ?.helpful_hints?.map((item) => ({
  //         ...item,
  //         value: item.value && t(`milestones:${item.value}`, tOpt({t, gender: child?.gender})),
  //       })),
  //   [milestoneAge, t, child],
  // );

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
        data={tips || []}
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
          <View style={{height: 40}}>
            {/*<PurpleArc width={'100%'} />*/}
            {/*<View style={{backgroundColor: colors.purple}}>*/}
            {/*  <ButtonWithChevron onPress={onPressNextSection}>{t('nextSection')}</ButtonWithChevron>*/}
            {/*</View>*/}
          </View>
        )}
        renderItem={({item}) => (
          <Item
            onLikePress={(id, value) => {
              id && child?.id && setTip({hintId: id, childId: child?.id, like: value});
            }}
            onRemindMePress={(id, value) => {
              id && child?.id && setTip({hintId: id, childId: child?.id, remindMe: value});
            }}
            t={t}
            like={item.like}
            itemId={item.id}
            title={item.value}
            childId={child?.id}
          />
        )}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  );
};

export default TipsAndActivitiesScreen;
