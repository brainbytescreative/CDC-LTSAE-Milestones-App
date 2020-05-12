import React, {useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {ChevronLeft, ChevronRight} from '../../resources/svg';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {childAges, colors} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useGetMonthProgress} from '../../hooks/checklistHooks';

interface Props {
  currentAgeIndex: number;
  childAge: number;
}

const Item: React.FC<{childAge: number; childId?: number; month: number}> = ({month, childAge, childId}) => {
  const {t} = useTranslation('dashboard');
  const isCurrent = childAge === month;
  const suffix = isCurrent ? '' : 'Short';
  const unit =
    month % 12 === 0 ? t(`common:year${suffix}`, {count: month / 12}) : t(`common:month${suffix}`, {count: month});

  const {data: progress = 0} = useGetMonthProgress({childId, milestone: month});

  return (
    <TouchableOpacity>
      <View style={{padding: 5, height: 100, justifyContent: 'center'}}>
        <AnimatedCircularProgress
          rotation={0}
          size={isCurrent ? 68 : 44}
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
                  fontFamily: month === childAge ? 'Avenir-Heavy' : 'Avenir-light',
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

const MonthCarousel: React.FC<Props> = ({currentAgeIndex, childAge}) => {
  const flatListRef = useRef<any>(null);
  currentAgeIndex = currentAgeIndex === -1 || !currentAgeIndex ? 0 : currentAgeIndex;

  const [currentItemIndex, setCurrentItemIndex] = useState(currentAgeIndex);
  const {data: child} = useGetCurrentChild();

  useLayoutEffect(() => {
    setTimeout(() => {
      try {
        flatListRef.current.scrollToIndex({
          index: currentAgeIndex,
          viewPosition: 0.5,
        });
      } catch (e) {
        console.log(e);
      }
    }, 500);
  }, [currentAgeIndex]);

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
          if (currentAgeIndex > 1) {
            flatListRef.current.scrollToIndex({
              index: currentItemIndex - 1,
              viewPosition: 0.5,
            });
            setCurrentItemIndex(currentItemIndex - 1);
          }
        }}>
        <ChevronLeft />
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        style={{
          marginHorizontal: 13,
        }}
        data={childAges}
        horizontal
        renderItem={({item}) => <Item month={item} childId={child?.id} childAge={childAge} />}
        keyExtractor={(item) => `${item}`}
      />
      <TouchableOpacity
        onPress={() => {
          if (currentAgeIndex < childAges.length - 1) {
            flatListRef.current.scrollToIndex({
              index: currentItemIndex + 1,
              viewPosition: 0.5,
            });
            setCurrentItemIndex(currentItemIndex + 1);
          }
        }}>
        <ChevronRight />
      </TouchableOpacity>
    </View>
  );
};

export default MonthCarousel;
