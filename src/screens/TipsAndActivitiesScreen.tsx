import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, PropType, sharedStyle} from '../resources/constants';
import {TFunction} from 'i18next';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import ChildPhoto from '../components/ChildPhoto';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {formatAge} from '../utils/helpers';
import LikeHeart from '../components/Svg/LikeHeart';
import {Tip, useGetMilestone, useGetTips, useGetTipValue, useSetTip} from '../hooks/checklistHooks';
import DropDownPicker from '../components/DropDownPicker';
import AEScrollView from '../components/AEScrollView';
import {useCancelNotificationById, useSetTipsAndActivitiesNotification} from '../hooks/notificationsHooks';
import Chevron from '../components/Svg/Chevron';

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

const tipFilters = ['all', 'like', 'remindMe'];
type TipType = typeof tipFilters[number];

const TipsAndActivitiesScreen: React.FC<{}> = () => {
  const {t} = useTranslation('tipsAndActivities');
  const [tipType, setTipType] = useState<TipType>('all');
  const {data: child} = useGetCurrentChild();
  const {data: tips} = useGetTips();
  const [setTip] = useSetTip();
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const [setNotification] = useSetTipsAndActivitiesNotification();
  const [cancelNotification] = useCancelNotificationById();

  let sortedTips;

  switch (tipType) {
    case 'like':
      sortedTips =
        tips &&
        [...tips].sort((a, b) => {
          if (a?.like && !b.like) {
            return -1;
          }
          return 0;
        });
      break;
    case 'remindMe':
      sortedTips = tips?.slice().sort((a, b) => {
        if (a?.remindMe && !b.remindMe) {
          return -1;
        }
        return 0;
      });
      break;
    default:
      sortedTips = tips;
      break;
  }

  const onRemindMePress = useCallback<NonNullable<PropType<ItemProps, 'onRemindMePress'>>>(
    (id, value) => {
      id && child?.id && setTip({hintId: id, childId: child?.id, remindMe: value});

      const selectedTip = tips?.filter(({id: tipId}) => id === tipId)[0];
      const notificationId = `tips-${id}-${child?.id}-${milestoneId}`;

      if (id && selectedTip?.key && child?.id && value) {
        milestoneId && setNotification({notificationId, bodyKey: selectedTip.key, milestoneId, childId: child.id});
      } else if (id && child?.id && !value) {
        notificationId && cancelNotification({notificationId});
      }
    },
    [tips, setTip, setNotification, child, milestoneId, cancelNotification],
  );

  const onLikePress: PropType<ItemProps, 'onLikePress'> = (id, value) => {
    id && child?.id && setTip({hintId: id, childId: child?.id, like: value});
  };

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
      <AEScrollView>
        <ChildSelectorModal />
        <ChildPhoto photo={child?.photo} />
        <Text style={{textAlign: 'center', fontSize: 22, fontFamily: 'Montserrat-Bold'}}>{t('title')}</Text>
        <Text style={{textAlign: 'center', fontSize: 15, marginTop: 20, marginHorizontal: 50}}>
          {t('subtitle', {
            childAge: formatAge(child?.birthday),
          })}
        </Text>

        <DropDownPicker
          customArrowDown={<Chevron direction={'up'} />}
          customArrowUp={<Chevron direction={'down'} />}
          containerStyle={{
            marginTop: 30,
            marginHorizontal: 32,
            height: 45,
          }}
          style={[
            sharedStyle.shadow,
            sharedStyle.border,
            {
              height: 100,
              backgroundColor: colors.iceCold,
            },
          ]}
          itemsContainerStyle={{backgroundColor: colors.iceCold}}
          labelStyle={[sharedStyle.boldText, {flexGrow: 1, fontSize: 18, paddingHorizontal: 5}]}
          zIndex={20000}
          defaultNull
          placeholder={t('all')}
          items={tipFilters.map((value) => ({label: t(value), value}))}
          onChangeItem={(item) => setTipType(item.value as TipType)}
        />

        {sortedTips?.map((item, index) => (
          <Item
            key={`${item.id}-${index}`}
            onLikePress={onLikePress}
            onRemindMePress={onRemindMePress}
            t={t}
            like={item.like}
            itemId={item.id}
            title={item.value}
            childId={child?.id}
          />
        ))}
        <View style={{height: 40}}>
          {/*<PurpleArc width={'100%'} />*/}
          {/*<View style={{backgroundColor: colors.purple}}>*/}
          {/*  <ButtonWithChevron onPress={onPressNextSection}>{t('nextSection')}</ButtonWithChevron>*/}
          {/*</View>*/}
        </View>
      </AEScrollView>
    </View>
  );
};

export default TipsAndActivitiesScreen;
