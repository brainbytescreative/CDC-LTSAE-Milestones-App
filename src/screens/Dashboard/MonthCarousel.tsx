import React, {useLayoutEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import {ChevronLeft, ChevronRight} from '../../resources/svg';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {colors} from '../../resources/constants';
import {useTranslation} from 'react-i18next';

export interface DataItem {
  month: number;
  progress?: number;
}

interface Props {
  currentAgeIndex: number;
  data: DataItem[];
  childAge: number;
}

const Item: React.FC<DataItem & {childAge: number}> = ({
  month,
  childAge,
  progress,
}) => {
  const {t} = useTranslation('dashboard');
  return (
    <TouchableOpacity>
      <View style={{padding: 5, height: 100, justifyContent: 'center'}}>
        <AnimatedCircularProgress
          rotation={0}
          size={childAge === month ? 68 : 44}
          width={2}
          fill={progress}
          tintColor={colors.iceCold}
          backgroundColor={
            month >= childAge ? colors.lightGray : 'transparent'
          }>
          {() => (
            <View
              style={{
                backgroundColor:
                  month < childAge
                    ? colors.aquamarineTransparent
                    : 'transparent',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily:
                    month === childAge ? 'Avenir-Heavy' : 'Avenir-light',
                }}>
                {t('carouselAge', {value: month, unit: 'mo'})}
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  );
};

const MonthCarousel: React.FC<Props> = ({currentAgeIndex, data, childAge}) => {
  const flatListRef = useRef<any>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(currentAgeIndex);

  useLayoutEffect(() => {
    setTimeout(() => {
      flatListRef.current.scrollToIndex({
        index: currentAgeIndex,
        viewPosition: 0.5,
      });
    }, 100);
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
        data={data}
        horizontal
        renderItem={({item}) => <Item {...item} childAge={childAge} />}
        keyExtractor={(item) => `${item.month}`}
      />
      <TouchableOpacity
        onPress={() => {
          if (currentAgeIndex < data.length - 1) {
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
