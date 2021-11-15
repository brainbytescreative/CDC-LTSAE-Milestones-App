import _ from 'lodash';
import React, {useCallback, useLayoutEffect, useMemo, useRef, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

import ChevronLeft from '../../components/Svg/ChevronLeft';
import ChevronRight from '../../components/Svg/ChevronRight';
import withSuspense from '../../components/withSuspense';
import {useGetMilestone, useGetMonthProgress, useSetMilestoneAge} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {PropType, colors, milestonesIds} from '../../resources/constants';

interface ItemProps {
  childAge: number;
  milestone: number;
  childId?: number;
  month: number;
  onSelect?: (age: number) => void;
  isForDataArchive?: boolean;
}

const styles = StyleSheet.create({
  spinnerContainer: {
    alignContent: 'center',
    justifyContent: 'center',
  },
});

const Item: React.FC<ItemProps> = ({month, childAge, childId, onSelect, milestone, isForDataArchive}) => {
  const {t} = useTranslation('dashboard');
  const isCurrentMilestone = milestone === month;
  const unit = month % 12 === 0 ? t('common:year', {count: month / 12}) : t('common:month', {count: month});
  const unitShort =
    month % 12 === 0 ? t('common:yearShort', {count: month / 12}) : t('common:monthShort', {count: month});

  return (
    <TouchableOpacity
      accessibilityRole={'button'}
      onPress={() => {
        onSelect && onSelect(month);
      }}>
      <View style={{paddingVertical: 5, paddingHorizontal: isForDataArchive ? 2 : 5, marginHorizontal: isForDataArchive ? 0 : 4, height: isForDataArchive ? 55 : 60, justifyContent: 'center'}}>
        <AnimatedCircularProgress
          rotation={0}
          size={isForDataArchive ? 33 : 40}
          width={1}
          fill={0}
          backgroundColor={isCurrentMilestone ? colors.black : 'transparent'}>
          {() => (
            <View
              style={{
                backgroundColor: colors.white,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                accessibilityLabel={unit}
                style={{
                  fontSize: 10,
                  fontFamily: 'Avenir-light',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: isForDataArchive ? 7 : 13
                }}>
                {isForDataArchive ? '\n' : ''}
                {unitShort}
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  );
};

type onViewableItemsChanged = NonNullable<PropType<Required<FlatListProps<any>>, 'onViewableItemsChanged'>>;

export interface ChecklistMonthCarouselProps {
    isForDataArchiveDesign?: boolean;
}

const ChecklistMonthCarousel: React.FC<ChecklistMonthCarouselProps> = withSuspense(
  ({ isForDataArchiveDesign }) => {
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
          viewOffset: Platform.select({default: 0, android: -25}),
          viewPosition: 0.5,
        });
      }, Platform.select({default: 0, android: 500}));
    }, [currentAgeIndex]);

    if (Platform.OS === 'android') {
      useEffect(() => {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: currentAgeIndex,
            viewOffset: -25,
            viewPosition: 0.5,
          });
        }, 2500);
      }, []);
    }

    const onViewableItemsChanged = useCallback<onViewableItemsChanged>((info) => {
      const first = _.first(info.viewableItems)?.index;
      const last = _.last(info.viewableItems)?.index;
      visible.current = {first, last};
    }, []);

    // workaround to fix crashes on fast refresh
    const flatListKey = useMemo(() => Math.random(), []);

    const {t} = useTranslation();

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: isForDataArchiveDesign ? 23 : 32,
          backgroundColor: isForDataArchiveDesign ? colors.iceCold : colors.purple
        }}>
        {isForDataArchiveDesign &&
            <View style={{width: '15%', marginRight: 2}}>
                <Text numberOfLines={2} style={{fontSize: 12, fontWeight: 'bold'}}>{t('milestoneChecklist:selectAnAge')}</Text>
            </View>
        }
        <TouchableOpacity
          accessibilityRole={'button'}
          accessibilityLabel={t('accessibility:previousButton')}
          hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
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
          getItemLayout={Platform.OS === 'android' ? (_, index) => ({length: 65, offset: 65 * index, index}) : undefined}
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
              isForDataArchive={isForDataArchiveDesign}
            />
          )}
          keyExtractor={(item) => `${item}`}
        />
        <TouchableOpacity
          accessibilityRole={'button'}
          accessibilityLabel={t('accessibility:nextButton')}
          hitSlop={{top: 30, bottom: 30, left: 30, right: 30}}
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
  },
  {shared: {suspense: true}},
  <View style={[{height: 172}, styles.spinnerContainer]}>
    <ActivityIndicator size={'large'} />
  </View>,
);

export default ChecklistMonthCarousel;