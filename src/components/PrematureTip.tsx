import {differenceInYears} from 'date-fns';
import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Linking, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useGetMilestone} from '../hooks/checklistHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {sharedStyle} from '../resources/constants';
import AEYellowBox from './AEYellowBox';

const PrematureTip: React.FC<{style?: StyleProp<ViewStyle>; children?: React.ReactElement}> = ({style, children}) => {
  const {t} = useTranslation('dashboard');
  const {data: child} = useGetCurrentChild();
  const ageInYears = Number(child?.realBirthDay && differenceInYears(new Date(), child?.realBirthDay));
  const prematureWeeks = t('common:week', {count: Number(child?.weeksPremature)});
  const {data: {childAge, milestoneAge} = {}} = useGetMilestone();

  return Number(child?.weeksPremature) >= 4 && ageInYears < 2 && childAge === milestoneAge ? (
    <AEYellowBox containerStyle={[styles.yellowTipContainer, {marginBottom: 0, marginTop: 50}, style]}>
      <Trans t={t} i18nKey={'prematureTip'} tOptions={{weeks: prematureWeeks}}>
        <Text
          numberOfLines={1}
          accessibilityRole={'link'}
          onPress={() => {
            return Linking.openURL('http://bit.ly/2RUpEu1');
          }}
          style={[{textDecorationLine: 'underline', textAlign: 'center'}, sharedStyle.boldText]}
        />
      </Trans>
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
