import React, {useState} from 'react';
import {View} from 'react-native';
import Layout from '../../components/Layout';
import {Button, Modal, Portal, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {colors, routeKeys} from '../../resources/constants';
import LanguageSelector from '../../components/LanguageSelector';

const OnboardingInfoScreen: React.FC<{}> = () => {
  const [visible, setVisible] = useState(true);
  const {t} = useTranslation('onboardingInfo');
  const navigation = useNavigation();

  return (
    <Layout>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 50,
        }}>
        <Text style={{borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20}}>LOGO</Text>
        <Text
          style={{
            marginLeft: 20,
            borderWidth: 1,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}>
          LOGO
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View>
          <Text style={{fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}>{t('welcome').toUpperCase()}</Text>
          <Text style={{margin: 20, textAlign: 'center'}}>{t('welcome1p')}</Text>
          <Text style={{margin: 20, textAlign: 'center'}}>{t('welcome2p')}</Text>
        </View>
        <Button
          mode={'contained'}
          style={{marginVertical: 50}}
          onPress={() => {
            navigation.navigate(routeKeys.OnboardingParentProfile);
          }}>
          {t('getStartedBtn')}
        </Button>
      </View>
      <Portal>
        <Modal
          theme={{
            colors: {
              backdrop: colors.whiteTransparent,
            },
          }}
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
    </Layout>
  );
};
export default OnboardingInfoScreen;
