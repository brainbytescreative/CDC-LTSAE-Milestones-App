import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Modal, Portal, Title, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../resources/constants';
import LanguageSelector from '../../components/LanguageSelector';
import {CDClogo, IceColdArc, PurpleArc} from '../../resources/svg';
import {useSafeArea} from 'react-native-safe-area-context';
import AEScrollView from '../../components/AEScrollView';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {OnboardingNavigationProp} from '../../components/Navigator/types';

const OnboardingInfoScreen: React.FC<{}> = () => {
  const [visible, setVisible] = useState(true);
  const {t} = useTranslation('onboardingInfo');
  const navigation = useNavigation<OnboardingNavigationProp>();
  const {bottom, top} = useSafeArea();

  return (
    <AEScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flexGrow: 2}}>
          <View style={{backgroundColor: colors.iceCold, flexGrow: 1, justifyContent: 'space-around'}}>
            <View style={{alignItems: 'center', marginTop: 16 + top}}>
              <Text style={{fontSize: 10, marginBottom: 7}}>{t('broughtToYouBy')}</Text>
              <View style={styles.logosRow}>
                <CDClogo />
                <Image style={{marginLeft: 24}} source={require('../../resources/images/LTSAE_Logo.png')} />
              </View>
            </View>
            <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 16, fontFamily: 'Montserrat-Bold'}}>
              {t('welcome')}
            </Text>
          </View>
          <IceColdArc width={'100%'} />
        </View>

        <View style={{backgroundColor: 'white', flexGrow: 1, justifyContent: 'center'}}>
          <Text
            style={{
              marginHorizontal: 32,
              marginVertical: 16,
              textAlign: 'center',
              fontSize: 15,
            }}>
            {t('welcome1p')}
          </Text>
        </View>

        <View style={{flexGrow: 3}}>
          <PurpleArc width={'100%'} />
          <View
            style={{
              flexGrow: 1,
              backgroundColor: colors.purple,
              paddingBottom: bottom,
              justifyContent: 'space-around',
            }}>
            <Text
              style={{
                marginHorizontal: 32,
                textAlign: 'center',
                fontSize: 22,
                fontFamily: 'Montserrat-Bold',
              }}>
              {t('welcome2p')}
            </Text>
            <View
              style={{
                marginHorizontal: 32,
                marginTop: 16,
              }}>
              {Array.from(new Array(6)).map((value, index) => (
                <Text style={[{fontSize: 15}, index !== 0 && {marginTop: 6}]} key={`list-item-${index}`}>
                  <Text style={{fontFamily: 'Montserrat-Bold'}}>{'+   '}</Text>
                  {t('list', {context: `${index}`})}
                </Text>
              ))}
            </View>
            <AEButtonRounded
              onPress={() => {
                navigation.navigate('OnboardingParentProfile');
              }}>
              {t('getStartedBtn')}
            </AEButtonRounded>
          </View>
        </View>

        <Portal>
          <Modal
            contentContainerStyle={{
              backgroundColor: '#fff',
              margin: 32,
              paddingHorizontal: 16,
              paddingVertical: 22,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.darkGray,
            }}
            onDismiss={() => {
              setVisible(false);
            }}
            visible={visible}>
            <LanguageSelector title={'Select a Language/\nSeleccione Un Idioma'} />
          </Modal>
        </Portal>
      </View>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  logosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingInfoScreen;
