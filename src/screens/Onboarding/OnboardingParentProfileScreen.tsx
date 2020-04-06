import React, {useState} from 'react';
import {View} from 'react-native';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {routeKeys} from '../../resources/constants';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LanguageSelector from '../../components/LanguageSelector';
import ParentProfileSelector from '../../components/ParentProfileSelector';
import Text from '../../components/Text';

const OnboardingParentProfileScreen: React.FC<{}> = () => {
  const {t} = useTranslation('onboardingParentProfile');
  const navigation = useNavigation();
  const [territory, setTerritory] = useState<null | string>(null);

  return (
    <Layout style={{justifyContent: 'space-between'}}>
      <View>
        <Text style={{fontWeight: 'bold', margin: 10, fontSize: 20}}>{t('parentProfile').toUpperCase()}</Text>
        <ParentProfileSelector onChange={(values) => setTerritory(values.territory)} />
        <LanguageSelector />
        <Text style={{textAlign: 'center'}}>{t('common:required')}</Text>
      </View>
      <View style={{alignItems: 'center'}}>
        <Button
          disabled={territory === null}
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

export default OnboardingParentProfileScreen;
