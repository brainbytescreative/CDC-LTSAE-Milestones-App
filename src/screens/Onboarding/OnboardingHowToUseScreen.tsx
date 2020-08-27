import ViewPager from '@react-native-community/viewpager';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import i18next from 'i18next';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonMultiline from '../../components/AEButtonMultiline';
import {RootStackParamList} from '../../components/Navigator/types';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import PurpleArc from '../../components/Svg/PurpleArc';
import {colors, sharedStyle} from '../../resources/constants';

type HowToUseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingHowToUse'>;

// const NextScreen: keyof RootStackParamList = 'Dashboard';

const newUserEnImages = [
  require('./../../resources/images/howto/how_to_new_en_1.png'),
  require('./../../resources/images/howto/how_to_new_en_2.png'),
  require('./../../resources/images/howto/how_to_new_en_3.png'),
  require('./../../resources/images/howto/how_to_new_en_4.png'),
  require('./../../resources/images/howto/how_to_new_en_5.png'),
];
const newUserEsImages = [
  require('./../../resources/images/howto/how_to_new_es_1.png'),
  require('./../../resources/images/howto/how_to_new_es_2.png'),
  require('./../../resources/images/howto/how_to_new_es_3.png'),
  require('./../../resources/images/howto/how_to_new_es_4.png'),
  require('./../../resources/images/howto/how_to_new_es_5.png'),
];

const images = {
  en: {
    new: newUserEnImages,
    current: [
      require('./../../resources/images/howto/how_to_current_en_1.png'),
      require('./../../resources/images/howto/how_to_current_en_2.png'),
      ...newUserEnImages,
    ],
  },
  es: {
    new: newUserEsImages,
    current: [
      require('./../../resources/images/howto/how_to_current_es_1.png'),
      require('./../../resources/images/howto/how_to_current_es_2.png'),
      ...newUserEsImages,
    ],
  },
};

const OnboardingHowToUseScreen: React.FC<{route?: RouteProp<RootStackParamList, 'OnboardingHowToUse'>}> = ({route}) => {
  const {t} = useTranslation('onboardingHowToUse');
  const navigation = useNavigation<HowToUseScreenNavigationProp>();
  const {top, bottom} = useSafeAreaInsets();
  const [position, setPosition] = useState(0);

  const userType = route?.params?.isOldUser ? 'current' : 'new';
  const stubArray = images[i18next.language as 'en' | 'es'][userType];

  return (
    <View style={{flex: 1, backgroundColor: colors.iceCold, paddingTop: top}}>
      <View style={{flexGrow: 6, justifyContent: 'space-between', backgroundColor: 'white'}}>
        <View style={{top: 0, position: 'absolute', width: '100%', height: '40%'}}>
          <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
          <NavBarBackground width={'100%'} />
        </View>
        {/*<CancelDoneTopControl*/}
        {/*  onCancel={() => {*/}
        {/*    navigation.navigate(NextScreen);*/}
        {/*  }}*/}
        {/*  onDone={() => {*/}
        {/*    navigation.navigate('Dashboard');*/}
        {/*  }}*/}
        {/*/>*/}
        <Text
          style={[
            {
              fontSize: 20,
              textAlign: 'center',
              margin: 20,
            },
            sharedStyle.boldText,
          ]}>
          {t('howToUseApp')}
        </Text>
        <ViewPager
          onPageSelected={(event) => {
            setPosition(event.nativeEvent.position);
          }}
          style={styles.viewPager}
          initialPage={0}>
          {
            stubArray.map((value, index) => (
              <Image key={`how-to-image-${index}`} resizeMode={'contain'} source={value} />
            )) as any
          }
        </ViewPager>
      </View>

      <View style={{backgroundColor: 'white'}}>
        <PurpleArc width={'100%'} />
        <View style={{backgroundColor: colors.purple, flexGrow: 1, paddingBottom: bottom}}>
          <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 16, marginTop: 12}}>
            {stubArray.map((value, index) => (
              <View
                style={[
                  {
                    width: 10,
                    height: 10,
                    backgroundColor: index === position ? colors.black : colors.white,
                    marginHorizontal: 2,
                    borderRadius: 10,
                  },
                  sharedStyle.shadow,
                ]}
              />
            ))}
          </View>
          <AEButtonMultiline
            onPress={() => {
              navigation.navigate('Dashboard');
            }}>
            {t('common:getStartedBtn')}
          </AEButtonMultiline>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
    margin: 20,
    // borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
  },
});

export default OnboardingHowToUseScreen;
