import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import ViewPager from '@react-native-community/viewpager';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../components/Navigator/types';
import {colors, sharedStyle} from '../../resources/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import CancelDoneTopControl from '../../components/CancelDoneTopControl';
import NavBarBackground from '../../components/Svg/NavBarBackground';
import PurpleArc from '../../components/Svg/PurpleArc';

type HowToUseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingHowToUse'>;

const NextScreen: keyof RootStackParamList = 'Dashboard';
const stubArray = Array.from(new Array(5));

const OnboardingHowToUseScreen: React.FC = () => {
  const {t} = useTranslation('onboardingHowToUse');
  const navigation = useNavigation<HowToUseScreenNavigationProp>();
  const {top, bottom} = useSafeAreaInsets();
  const [position, setPosition] = useState(0);

  return (
    <View style={{flex: 1, backgroundColor: colors.iceCold, paddingTop: top}}>
      <View style={{flexGrow: 6, justifyContent: 'space-between', backgroundColor: 'white'}}>
        <View style={{top: 0, position: 'absolute', width: '100%', height: '40%'}}>
          <View style={{backgroundColor: colors.iceCold, flexGrow: 1}} />
          <NavBarBackground width={'100%'} />
        </View>
        <CancelDoneTopControl
          onCancel={() => {
            navigation.navigate(NextScreen);
          }}
          onDone={() => {
            navigation.navigate('Dashboard');
          }}
        />
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
            stubArray.map(() => (
              <Image resizeMode={'contain'} source={require('../../resources/images/howToUseSlide.png')} />
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
          <AEButtonRounded
            onPress={() => {
              navigation.navigate('Dashboard');
            }}>
            {t('common:getStartedBtn')}
          </AEButtonRounded>
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
