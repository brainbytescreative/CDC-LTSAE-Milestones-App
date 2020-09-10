import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, ScrollView, View} from 'react-native';
import {Text} from 'react-native-paper';

import AEScrollView from '../../components/AEScrollView';
import ChildPhoto from '../../components/ChildPhoto';
import ChildSelectorModal from '../../components/ChildSelectorModal';
import DropDownPicker from '../../components/DropDownPicker';
import Chevron from '../../components/Svg/Chevron';
import ShortHeaderArc from '../../components/Svg/ShortHeaderArc';
import {useGetMilestone, useGetTips, useSetTip} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useCancelNotificationById, useSetTipsAndActivitiesNotification} from '../../hooks/notificationsHooks';
import {PropType, colors, sharedStyle} from '../../resources/constants';
import {trackInteractionByType} from '../../utils/analytics';
import {formatAge} from '../../utils/helpers';
import TipsAndActivitiesItem, {ItemProps} from './TipsAndActivitiesItem';

const tipFilters = ['all', 'like', 'remindMe'];
type TipType = typeof tipFilters[number];

const TipsAndActivitiesScreen: React.FC<{route?: {params?: {notificationId?: string}}}> = ({route}) => {
  const {t} = useTranslation('tipsAndActivities');
  const [tipType, setTipType] = useState<TipType>('all');
  const {data: child} = useGetCurrentChild();
  const {data: tips} = useGetTips();
  const [setTip] = useSetTip();
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const [setNotification] = useSetTipsAndActivitiesNotification();
  const [cancelNotification] = useCancelNotificationById();
  const positionMap = useRef(new Map<number, number>());
  const scrollView = useRef<ScrollView | undefined>(undefined);
  const [highlightedTip, setHighlightedTip] = useState<number | undefined>();

  const notificationIdParam = route?.params?.notificationId;

  useLayoutEffect(() => {
    if (notificationIdParam) {
      setTipType('all');
      const [, tipId] = notificationIdParam.match(/^tips-(\d+)/) ?? [];
      const number = Number(tipId);
      setTimeout(() => {
        const position = positionMap.current.get(number);
        position && scrollView.current?.scrollTo({y: position});
      }, 1000);
      setHighlightedTip(number);
    }
  }, [notificationIdParam]);

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
      trackInteractionByType('Remind Me', {tipData: {milestoneId: Number(milestoneId), hintId: Number(id)}});
      id && child?.id && setTip({hintId: id, childId: child?.id, remindMe: value});

      const selectedTip = (tips || []).filter(({id: tipId}) => id === tipId)[0];
      const notificationId = `tips-${id}-${child?.id}-${milestoneId}`;

      if (id && selectedTip?.key && child?.id && value) {
        milestoneId && setNotification({notificationId, bodyKey: selectedTip.key, milestoneId, childId: child.id});
      } else if (id && child?.id && !value) {
        notificationId && cancelNotification({notificationId});
      }
      setHighlightedTip(undefined);
    },
    [tips, setTip, setNotification, child?.id, milestoneId, cancelNotification],
  );

  const onLikePress: PropType<ItemProps, 'onLikePress'> = (id, value) => {
    trackInteractionByType('Like', {tipData: {milestoneId: Number(milestoneId), hintId: Number(id)}});
    id && child?.id && setTip({hintId: id, childId: child?.id, like: value});
    setHighlightedTip(undefined);
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
      <AEScrollView innerRef={scrollView}>
        <ChildSelectorModal />
        <ChildPhoto photo={child?.photo} />
        <Text style={[{textAlign: 'center'}, sharedStyle.largeBoldText]}>{t('title')}</Text>
        <Text style={[{textAlign: 'center', marginTop: 20, marginHorizontal: 50}, sharedStyle.regularText]}>
          {t('subtitle', {
            childAge: formatAge(child?.birthday, {singular: true}),
            babyOrChild: Number(milestoneId) > 12 ? t('common:child') : t('common:baby'),
          })}
        </Text>

        <View
          style={{
            marginTop: 30,
            marginHorizontal: 32,
            ...Platform.select({
              ios: {
                zIndex: 200,
              },
            }),
          }}>
          <DropDownPicker
            customArrowDown={<Chevron direction={'up'} />}
            customArrowUp={<Chevron direction={'down'} />}
            style={[sharedStyle.shadow, {backgroundColor: colors.iceCold, paddingVertical: 5}]}
            itemsContainerStyle={{backgroundColor: colors.iceCold}}
            labelStyle={[sharedStyle.midTextBold, {flexGrow: 1, paddingHorizontal: 5}]}
            defaultNull
            placeholder={t('all')}
            items={tipFilters.map((value) => ({label: t(value), value}))}
            onChangeItem={(item) => setTipType(item.value as TipType)}
          />
        </View>

        {sortedTips?.map((item, index) => (
          // <View>
          <TipsAndActivitiesItem
            isHighlighted={Boolean(highlightedTip) && item.id === highlightedTip}
            onLayout={(event) => {
              // console.log(event.nativeEvent.layout.height);
              positionMap.current.set(Number(item.id), event.nativeEvent.layout.y);
            }}
            key={`${item.id}-${index}`}
            onLikePress={onLikePress}
            onRemindMePress={onRemindMePress}
            t={t}
            like={item.like}
            itemId={item.id}
            title={item.value}
            childId={child?.id}
          />
          // </View>
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
