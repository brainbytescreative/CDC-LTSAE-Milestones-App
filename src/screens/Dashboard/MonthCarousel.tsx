import React, {useCallback, useLayoutEffect, useMemo, useRef} from 'react';
import {FlatList, FlatListProps, Platform, Text, TouchableOpacity, View} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {colors, milestonesIds, PropType} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useGetMilestone, useGetMonthProgress, useSetMilestoneAge} from '../../hooks/checklistHooks';
import _ from 'lodash';
import ChevronLeft from '../../components/Svg/ChevronLeft';
import ChevronRight from '../../components/Svg/ChevronRight';

interface ItemProps {
  childAge: number;
  milestone: number;
  childId?: number;
  month: number;
  onSelect?: (age: number) => void;
}

const Item: React.FC<ItemProps> = ({month, childAge, childId, onSelect, milestone}) => {
  const {t} = useTranslation('dashboard');
  const isCurrentMilestone = milestone === month;
  const suffix = isCurrentMilestone ? '' : 'Short';
  const unit =
    month % 12 === 0 ? t(`common:year${suffix}`, {count: month / 12}) : t(`common:month${suffix}`, {count: month});

  const {data: progress = 0} = useGetMonthProgress({childId, milestone: month});

  return (
    <TouchableOpacity
      onPress={() => {
        onSelect && onSelect(month);
      }}>
      <View style={{padding: 5, height: 100, justifyContent: 'center'}}>
        <AnimatedCircularProgress
          rotation={0}
          size={isCurrentMilestone ? 68 : 44}
          width={2}
          fill={progress}
          tintColor={colors.iceCold}
          backgroundColor={month >= childAge ? colors.lightGray : 'transparent'}>
          {() => (
            <View
              style={{
                backgroundColor: month < childAge ? colors.aquamarineTransparent : 'transparent',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: month === milestone ? 'Avenir-Heavy' : 'Avenir-light',
                }}>
                {unit}
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  );
};

type onViewableItemsChanged = NonNullable<PropType<Required<FlatListProps<any>>, 'onViewableItemsChanged'>>;

const MonthCarousel: React.FC = () => {
  const flatListRef = useRef<FlatList | null>(null);
  const visible = useRef<{last?: number | null; first?: number | null} | undefined>(undefined);
  const {data: {childAge = 2, milestoneAge = 2} = {}} = useGetMilestone();
  const [setAge] = useSetMilestoneAge();

  const {data: child} = useGetCurrentChild();

  const currentAgeIndex = milestonesIds.findIndex((value) => value === milestoneAge);

  useLayoutEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: currentAgeIndex,
        viewPosition: 0.5,
      });
    }, Platform.select({default: 0, android: 500}));
  }, [currentAgeIndex]);

  const onViewableItemsChanged = useCallback<onViewableItemsChanged>((info) => {
    const first = _.first(info.viewableItems)?.index;
    const last = _.last(info.viewableItems)?.index;
    visible.current = {first, last};
  }, []);

  // workaround to fix crashes on fast refresh
  const flatListKey = useMemo(() => Math.random(), []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 40,
        marginHorizontal: 32,
      }}>
      <TouchableOpacity
        onPress={() => {
          const first = visible.current?.first || 0;
          flatListRef.current?.scrollToIndex({
            index: first,
            viewPosition: 0.5,
          });
        }}>
        <ChevronLeft />
      </TouchableOpacity>
      <FlatList
        key={flatListKey}
        ref={flatListRef}
        style={{
          marginHorizontal: 13,
        }}
        onScrollToIndexFailed={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: currentAgeIndex,
              viewPosition: 0.5,
            });
          }, 1000);
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        data={milestonesIds}
        extraData={{childId: child?.id, milstone: childAge}}
        horizontal
        renderItem={({item}) => (
          <Item
            onSelect={(age) => {
              setAge(age);
            }}
            month={item}
            childId={child?.id}
            childAge={childAge}
            milestone={milestoneAge}
          />
        )}
        keyExtractor={(item) => `${item}`}
      />
      <TouchableOpacity
        onPress={() => {
          const last = visible.current?.last || milestonesIds.length - 1;
          flatListRef.current?.scrollToIndex({
            index: last,
            viewPosition: 0.5,
          });
        }}>
        <ChevronRight />
      </TouchableOpacity>
    </View>
  );
};

export default MonthCarousel;
