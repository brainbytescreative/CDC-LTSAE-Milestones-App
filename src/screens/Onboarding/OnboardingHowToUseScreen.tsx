import React from 'react';
import {Text, View} from 'react-native';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {Button} from 'react-native-paper';
import {routeKeys} from '../../resources/constants';
import {useNavigation} from '@react-navigation/native';

const OnboardingHowToUseScreen: React.FC<{}> = () => {
  const {t} = useTranslation('onboardingHowToUse');
  const navigation = useNavigation();
  return (
    <Layout style={{justifyContent: 'space-between'}}>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 20,
          textAlign: 'center',
          margin: 20,
        }}>
        {t('howToUseApp')}
      </Text>
      <View style={{alignItems: 'center'}}>
        <Button
          mode={'contained'}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            navigation.navigate(routeKeys.OnboardingHowToUse);
          }}>
          {t('common:next').toUpperCase()}
        </Button>
      </View>
    </Layout>
  );
};
export default OnboardingHowToUseScreen;
