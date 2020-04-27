import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, Title} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {colors, sharedStyle} from '../../resources/constants';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import {PurpleArc} from '../../resources/svg';
import {useSafeArea} from 'react-native-safe-area-context';
import AEScrollView from '../../components/AEScrollView';

interface Props {
  onGetStarted: () => void;
  milestoneAgeFormatted: string | undefined;
}

const FrontPage: React.FC<Props> = ({onGetStarted, milestoneAgeFormatted}) => {
  const {t} = useTranslation('milestoneChecklist');
  const {bottom} = useSafeArea();
  return (
    <AEScrollView>
      <View style={{flexGrow: 1}}>
        <View style={{marginVertical: 32}}>
          <Title style={[styles.header]}>{milestoneAgeFormatted}</Title>
          <Title style={[styles.header]}>{t('milestoneChecklist')}</Title>
        </View>
        <View
          style={[
            {
              backgroundColor: colors.yellow,
              marginHorizontal: 32,
              borderRadius: 10,
              padding: 16,
              marginBottom: 32,
            },
            sharedStyle.shadow,
          ]}>
          <Text style={[styles.text]}>{t('message1')}</Text>
          <Text style={[styles.text, {marginTop: 15}]}>{t('message2')}</Text>
        </View>
      </View>

      <View>
        <PurpleArc width={'100%'} />
        <View style={{backgroundColor: colors.purple, flexGrow: 1, paddingBottom: bottom, paddingTop: 32}}>
          <Text style={[styles.text, {marginHorizontal: 32, marginBottom: 16}]}>{t('message3')}</Text>
          <AEButtonRounded onPress={onGetStarted}>{t('common:getStartedBtn')}</AEButtonRounded>
        </View>
      </View>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 22,
    textTransform: 'capitalize',
    marginTop: 5,
  },
  text: {
    textAlign: 'center',
    fontSize: 15,
  },
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FrontPage;
