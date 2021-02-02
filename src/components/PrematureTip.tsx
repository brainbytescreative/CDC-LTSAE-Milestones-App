import {differenceInWeeks, differenceInYears} from 'date-fns';
import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Linking, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useGetMilestone} from '../hooks/checklistHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {sharedStyle} from '../resources/constants';
import AEYellowBox from './AEYellowBox';

type Props = {style?: StyleProp<ViewStyle>; children?: React.ReactElement; sixWeeks?: boolean};

const PrematureTip: React.FC<Props> = ({style, children, sixWeeks}) => {
  const {t} = useTranslation('dashboard');
  const {data: child} = useGetCurrentChild();
  const ageInYears = Number(child?.realBirthDay && differenceInYears(new Date(), child?.realBirthDay));
  const prematureWeeks = t('common:week', {count: Number(child?.weeksPremature)});
  const {data: {childAge, milestoneAge} = {}} = useGetMilestone();
  const birthday = child?.birthday ?? new Date();
  const calcAgeInWeeks = differenceInWeeks(new Date(), birthday);
  const textKey = sixWeeks && calcAgeInWeeks < 6 ? 'prematureTip6Weeks' : 'prematureTip';

  return Number(child?.weeksPremature) >= 4 && ageInYears < 2 && childAge === milestoneAge ? (
    <AEYellowBox wrapper={'none'} containerStyle={[styles.yellowTipContainer, {marginBottom: 0, marginTop: 50}, style]}>
      <View style={{alignItems: 'center'}}>
        <Trans t={t} i18nKey={textKey} tOptions={{weeks: prematureWeeks}}>
          <Text
            numberOfLines={1}
            accessibilityRole={'link'}
            onPress={() => {
              return Linking.openURL('http://bit.ly/2RUpEu1');
            }}
            style={[{textDecorationLine: 'underline', textAlign: 'center'}, sharedStyle.boldText]}
          />
          <Text style={{textAlign: 'center'}} />
        </Trans>
      </View>
    </AEYellowBox>
  ) : (
    children ?? null
  );
};

export default PrematureTip;

const styles = StyleSheet.create({
  yellowTipContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 50,
    marginTop: 0,
    marginHorizontal: 32,
    alignItems: 'center',
    borderRadius: 20,
  },
});
