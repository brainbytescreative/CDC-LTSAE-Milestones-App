import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AEButtonMultiline from '../../components/AEButtonMultiline';
import AEScrollView from '../../components/AEScrollView';
import PrematureTip from '../../components/PrematureTip';
import PurpleArc from '../../components/Svg/PurpleArc';
import {colors, sharedStyle} from '../../resources/constants';
import {formattedAge} from '../../utils/helpers';

interface Props {
  onGetStarted: () => void;
  milestoneAge: number | undefined;
}

const FrontPage: React.FC<Props> = ({onGetStarted, milestoneAge}) => {
  const {t} = useTranslation('milestoneChecklist');
  const {bottom} = useSafeAreaInsets();
  const milestoneAgeFormatted = formattedAge(milestoneAge ?? 0, t, false, true).milestoneAgeFormatted;
  return (
    <AEScrollView>
      <View style={{flexGrow: 1}}>
        <View style={{marginVertical: 32}}>
          <Text style={[styles.header]}>{milestoneAgeFormatted}</Text>
          <Text style={[styles.header]}>{t('milestoneChecklist')}</Text>
        </View>

        <PrematureTip style={{marginTop: 0}}>
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
        </PrematureTip>
      </View>

      <View>
        <PurpleArc width={'100%'} />
        <View style={{backgroundColor: colors.purple, flexGrow: 1, paddingBottom: bottom, paddingTop: 32}}>
          <AEButtonMultiline onPress={onGetStarted}>{t('common:getStartedBtn')}</AEButtonMultiline>
        </View>
      </View>
    </AEScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 22,
    marginTop: 5,
    fontFamily: 'Montserrat-Bold',
  },
  text: {
    textAlign: 'center',
    fontSize: 15,
  },
});

export default FrontPage;
