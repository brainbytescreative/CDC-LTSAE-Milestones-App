import {TFunction} from 'i18next';
import React from 'react';
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native';
import {Text} from 'react-native-paper';

import LikeHeart from '../../components/Svg/LikeHeart';
import {Tip, useGetTipValue} from '../../hooks/checklistHooks';
import {colors, sharedStyle} from '../../resources/constants';

// import Animated, {
//   and,
//   block,
//   Clock,
//   cond,
//   Easing,
//   eq,
//   Extrapolate,
//   interpolate,
//   set,
//   startClock,
//   stopClock,
//   timing,
//   Value,
// } from 'react-native-reanimated';

export type ItemProps = {
  title: string | undefined;
  t: TFunction;
  itemId: number | undefined;
  onLikePress?: (id: number | undefined, value: boolean) => void;
  onRemindMePress?: (id: number | undefined, value: boolean) => void;
  childId?: number;
  isHighlighted: boolean;
} & Tip &
  Pick<ViewProps, 'onLayout'>;

// const runOpacityTimer = (clock: Clock, isHighlighted: boolean) => {
//   const state: Animated.TimingState = {
//     finished: new Value(0),
//     position: new Value(0),
//     time: new Value(0),
//     frameTime: new Value(0),
//   };
//
//   const animatedBkg = interpolate(state.position, {
//     inputRange: [0, 0.5, 1],
//     outputRange: [0, 1, 0],
//     extrapolate: Extrapolate.CLAMP,
//   });
//
//   const config = {
//     duration: 600,
//     toValue: new Value(isHighlighted ? 1 : 0),
//     easing: Easing.inOut(Easing.ease),
//   };
//
//   return block([
//     cond(eq(state.finished, 0), [startClock(clock)]),
//     timing(clock, state, config),
//     cond(state.finished, stopClock(clock)),
//     animatedBkg,
//   ]);
// };

const TipsAndActivitiesItem: React.FC<ItemProps> = ({
  title,
  t,
  itemId,
  onLikePress,
  childId,
  onRemindMePress,
  onLayout,
  isHighlighted,
}) => {
  const {data: {like, remindMe} = {}} = useGetTipValue({hintId: itemId, childId});
  // const clock = useRef(new Clock()).current;

  return (
    <View onLayout={onLayout}>
      <View
        style={[
          {
            marginHorizontal: 32,
            marginTop: 30,
            backgroundColor: isHighlighted ? colors.yellow : colors.white,
          },
          sharedStyle.shadow,
          sharedStyle.border,
        ]}>
        {/*<Animated.View*/}
        {/*  style={[*/}
        {/*    {*/}
        {/*      // opacity: runOpacityTimer(clock, isHighlighted),*/}
        {/*    },*/}
        {/*    sharedStyle.border,*/}
        {/*    {*/}
        {/*      width: '100%',*/}
        {/*      height: '100%',*/}
        {/*      position: 'absolute',*/}
        {/*      // backgroundColor: colors.yellow,*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*/>*/}
        <View
          style={{
            padding: 20,
            paddingBottom: 40,
          }}>
          {/*<Text>{JSON.stringify(isHighlighted)}</Text>*/}
          <Text>{title}</Text>
        </View>
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
          <TouchableOpacity style={itemStyle.buttonTouchable} onPress={() => onLikePress?.(itemId, !like)}>
            <LikeHeart selected={!!like} style={{marginRight: 5}} />
            <Text>{t('like')}</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            itemStyle.button,
            sharedStyle.border,
            sharedStyle.shadow,
            !!remindMe && {backgroundColor: colors.lightGreen},
          ]}>
          <TouchableOpacity
            style={itemStyle.buttonTouchable}
            onPress={() => {
              onRemindMePress?.(itemId, !remindMe);
            }}>
            <Text>{t('remindMe')}</Text>
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

export default TipsAndActivitiesItem;

// export default React.memo(TipsAndActivitiesItem, (prevProps, nextProps) => {
//   return prevProps.isHighlighted === nextProps.isHighlighted;
// });
