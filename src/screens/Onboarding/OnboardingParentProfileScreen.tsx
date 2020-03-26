import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Layout from '../../components/Layout';
import {useTranslation} from 'react-i18next';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/EvilIcons';
import {routeKeys, states} from '../../resources/constants';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import LanguageSelector from '../../components/LanguageSelector';

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 5,
    right: 5,
  },
});

const guardianTypes = ['guardian', 'healthcareProvider'];

const OnboardingParentProfileScreen: React.FC<{}> = () => {
  const {t} = useTranslation('onboardingParentProfile');
  const navigation = useNavigation();
  return (
    <Layout style={{justifyContent: 'space-between'}}>
      <View>
        <Text style={{fontWeight: 'bold', margin: 10, fontSize: 20}}>
          {t('parentProfile').toUpperCase()}
        </Text>
        <View style={{margin: 10}}>
          <RNPickerSelect
            style={pickerSelectStyles}
            placeholder={{
              label: 'Guardian / Healthcare Provider',
              value: null,
              color: '#9EA0A4',
            }}
            Icon={() => <Icon name="chevron-down" size={40} />}
            onValueChange={(value) => console.log(value)}
            items={guardianTypes.map((value) => ({
              label: t(`guardianTypes:${value}`),
              value,
            }))}
          />
        </View>
        <View style={{margin: 10}}>
          <RNPickerSelect
            placeholder={{
              label: 'State or Territory field *',
              value: null,
              color: '#9EA0A4',
            }}
            style={pickerSelectStyles}
            Icon={() => <Icon name="chevron-down" size={40} />}
            onValueChange={(value) => console.warn(value)}
            items={states.map((value) => ({
              label: t(`states:${value}`),
              value,
            }))}
          />
        </View>
        <LanguageSelector />
        <Text style={{textAlign: 'center'}}>* required field</Text>
      </View>
      <View style={{alignItems: 'center'}}>
        <Button
          mode={'contained'}
          style={{marginVertical: 50, width: 100}}
          onPress={() => {
            navigation.navigate(routeKeys.Dashboard);
          }}>
          {t('common:next').toUpperCase()}
        </Button>
      </View>
    </Layout>
  );
};
export default OnboardingParentProfileScreen;
