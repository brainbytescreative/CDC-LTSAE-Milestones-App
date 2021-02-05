import ViewPager from '@react-native-community/viewpager';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import i18next from 'i18next';
import React, {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonMultiline from '../../components/AEButtonMultiline';
import {RootStackParamList} from '../../components/Navigator/types';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import PurpleArc from '../../components/Svg/PurpleArc';
import {colors, sharedStyle} from '../../resources/constants';
import {trackAction} from '../../utils/analytics';

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

const eventNames = {
  new: ['Dashboard', 'Dashboard Progress', 'When to Act Early', "My Child's Summary", 'Tips & Activities '],
  current: [
    'Not A New User?',
    'Dashboard',
    'Dashboard Progress',
    'When to Act Early',
    "My Child's Summary",
    'Tips & Activities ',
  ],
};

const images = {
  en: {
    new: {
      images: newUserEnImages,
      alts: [
        'Screengrab showing how to navigate the app',
        'Screengrab showing how to keep track of milestones',
        'Screengrab showing the Act Early page',
        'Screengrab showing how to email and sharea summary',
        'Screengrab demonstrating tips and activities feature',
      ],
    },
    current: {
      images: [require('./../../resources/images/howto/how_to_current_en_1.png'), ...newUserEnImages],
      alts: [
        'Screengrab showing how to add a photo',
        'Captura de pantalla mostrando como navegar la aplicación',
        'Captura de pantalla mostrando como seguir los indicadores a los que ha respondido',
        'Captura de pantalla mostrando la página de Reaccione Pronto',
        'Captura de pantalla mostrando como enviar un correo electrónico y compartir un resumen',
        'Captura de pantalla demostrando la opción de consejos y actividades',
      ],
    },
  },
  es: {
    new: {
      images: newUserEsImages,
      alts: [
        'Captura de pantalla mostrando como navegar la aplicación',
        'Captura de pantalla mostrando como seguir los indicadores a los que ha respondido',
        'Captura de pantalla mostrando la página de Reaccione Pronto',
        'Captura de pantalla mostrando como enviar un correo electrónico y compartir un resumen',
        'Captura de pantalla demostrando la opción de consejos y actividades',
      ],
    },
    current: {
      images: [require('./../../resources/images/howto/how_to_current_es_1.png'), ...newUserEsImages],
    },
  },
};

const OnboardingHowToUseScreen: React.FC<{route?: RouteProp<RootStackParamList, 'OnboardingHowToUse'>}> = () => {
  const {t} = useTranslation('onboardingHowToUse');
  const navigation = useNavigation<HowToUseScreenNavigationProp>();
  const {top, bottom} = useSafeAreaInsets();
  const [position, setPosition] = useState<number>(0);
  const pagerRef = useRef<ViewPager>(null);

  const userType = 'new'; //route?.params?.isOldUser ? 'current' : 'new';
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
          ref={pagerRef}
          onPageSelected={({nativeEvent: {position: p}}) => {
            p !== position &&
              trackAction(`Select: How to Use App: ${eventNames[userType][p]}`, {page: 'How to Use App'});
            setPosition(p);
          }}
          style={styles.viewPager}
          initialPage={0}>
          {
            stubArray.images.map((value, index) => (
              <View accessibilityRole={'image'} style={{overflow: 'hidden'}}>
                <Image
                  accessible
                  key={`how-to-image-${index}`}
                  accessibilityLabel={stubArray.alts[index]}
                  resizeMode={'contain'}
                  source={value}
                  style={{width: '100%', height: '100%'}}
                />
              </View>
            )) as any
          }
        </ViewPager>
      </View>

      <View style={{backgroundColor: 'white'}}>
        <PurpleArc width={'100%'} />
        <View style={{backgroundColor: colors.purple, flexGrow: 1, paddingBottom: bottom}}>
          <TouchableOpacity
            accessible
            onPress={() => {
              if (position + 1 === stubArray.images.length) {
                pagerRef.current?.setPage(0);
              } else {
                pagerRef.current?.setPage(position + 1);
              }
            }}
            accessibilityRole={'button'}
            accessibilityLabel={t('common:pagination', {
              position: Number(position) + 1,
              count: stubArray.images.length,
            })}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 4,
              // marginTop: 12,
              padding: 12,
            }}>
            {stubArray.images.map((value, index) => (
              <View
                accessible
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
          </TouchableOpacity>
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
