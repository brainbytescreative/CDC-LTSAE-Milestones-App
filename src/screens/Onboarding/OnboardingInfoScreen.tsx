import React, {useState} from 'react';
import {View} from 'react-native';
import Layout from '../../components/Layout';
import {Button, Modal, Portal, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {routeKeys} from '../../resources/constants';
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
        <Text
          style={{borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20}}>
          LOGO
        </Text>
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
          <Text style={{fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}>
            {t('welcome').toUpperCase()}
          </Text>
          <Text style={{margin: 20, textAlign: 'center'}}>
            {t('welcome1p')}
          </Text>
          <Text style={{margin: 20, textAlign: 'center'}}>
            {t('welcome2p')}
          </Text>
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
          dismissable={false}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          visible={visible}>
          <View
            style={{backgroundColor: '#fff', flex: 0, alignItems: 'center'}}>
            <LanguageSelector />
            <Button
              mode={'contained'}
              style={{flex: 0, marginBottom: 10}}
              onPress={() => {
                setVisible(false);
              }}>
              {t('common:done')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </Layout>
  );
};
export default OnboardingInfoScreen;
