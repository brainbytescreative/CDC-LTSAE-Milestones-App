import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {ProgressBar} from 'react-native-paper';
import {colors} from '../../resources/constants';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {DashboardStackNavigationProp} from './DashboardScreen';
import {useGetChecklistQuestions} from '../../hooks/checklistHooks';

const MilestoneChecklistWidget: React.FC<{}> = () => {
  const {t} = useTranslation('dashboard');
  const navigation = useNavigation<DashboardStackNavigationProp>();
  const {data} = useGetChecklistQuestions();

  const totalProgress = data?.totalProgress;
  const totalProgressValue = data?.totalProgressValue;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('MilestoneChecklist');
      }}
      style={{backgroundColor: 'white', padding: 20, borderRadius: 15}}>
      <View style={styles.milestoneCheckListContainer}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'montserrat',
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
        color={colors.lightGreen}
      />
      <Text> {t('milestonesAnswered', {progress: totalProgress})}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  milestoneCheckListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default MilestoneChecklistWidget;
