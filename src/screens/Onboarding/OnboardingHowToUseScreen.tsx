import React from 'react';
import {StyleSheet, View} from 'react-native';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import {Button, Text} from 'react-native-paper';
import {routeKeys} from '../../resources/constants';
import {useNavigation} from '@react-navigation/native';
import ViewPager from '@react-native-community/viewpager';

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
    borderWidth: 1,
    margin: 20,
  },
});

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
      <ViewPager style={styles.viewPager} initialPage={0}>
        <View style={{backgroundColor: 'green'}} key="1">
          <Text>First page</Text>
        </View>
        <View style={{backgroundColor: 'red'}} key="2">
          <Text>Second page</Text>
        </View>
      </ViewPager>
      <View style={{alignItems: 'center'}}>
        <Button
          mode={'contained'}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            navigation.navigate(routeKeys.AddChild);
          }}>
          {t('common:next').toUpperCase()}
        </Button>
      </View>
    </Layout>
  );
};

export default OnboardingHowToUseScreen;
