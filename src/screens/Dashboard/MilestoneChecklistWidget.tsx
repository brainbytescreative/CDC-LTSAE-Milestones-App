import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native';
import {ProgressBar, Text} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import withSuspense from '../../components/withSuspense';
import {useGetChecklistQuestions} from '../../hooks/checklistHooks';
import {colors, sharedStyle} from '../../resources/constants';
import {trackSelectByType} from '../../utils/analytics';
import {DashboardStackNavigationProp} from './DashboardScreen';

const styles = StyleSheet.create({
  milestoneCheckListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spinnerContainer: {
    alignContent: 'center',
    justifyContent: 'center',
  },
});

const MilestoneChecklistWidget: React.FC = withSuspense(
  () => {
    const {t} = useTranslation('dashboard');
    const navigation = useNavigation<DashboardStackNavigationProp>();
    const {data: {totalProgress, totalProgressValue} = {}} = useGetChecklistQuestions();

    return (
      <TouchableOpacity
        accessibilityRole={'button'}
        accessibilityLabel={`${t('milestoneCheckList')}.${t('milestonesAnswered', {
          progress: totalProgress?.replace('/', ' of '),
        })}`}
        onPress={() => {
          navigation.navigate('MilestoneChecklistStack');
          trackSelectByType('Milestone Checklist');
        }}
        style={[{backgroundColor: 'white', padding: 20, borderRadius: 15, overflow: 'visible'}, sharedStyle.shadow]}>
        <View style={styles.milestoneCheckListContainer}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontSize: 20,
              fontFamily: 'Montserrat-Bold',
            }}>
            {t('milestoneCheckList')}
          </Text>
          <EvilIcons name={'chevron-right'} size={30} />
        </View>
        <ProgressBar
          style={{
            height: 10,
            borderRadius: 5,
            marginVertical: 10,
          }}
          progress={totalProgressValue}
          color={colors.darkGreen}
        />
        <Text>{t('milestonesAnswered', {progress: totalProgress})}</Text>
      </TouchableOpacity>
    );
  },
  {shared: {suspense: true}},
  <View style={[{height: 114}, styles.spinnerContainer]}>
    <ActivityIndicator size={'large'} />
  </View>,
);

export default MilestoneChecklistWidget;
