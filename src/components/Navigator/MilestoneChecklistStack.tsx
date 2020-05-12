import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {MilestoneCheckListParamList} from './types';
import BurgerButton from '../BurgerButton';
import MilestoneChecklistScreen from '../../screens/MilestoneChecklistScreen/MilestoneChecklistScreen';
import {sharedScreenOptions} from '../../resources/constants';
import MilestoneChecklistGetStartedScreen from '../../screens/MilestoneChecklistScreen/MilestoneChecklistGetStartedScreen';
import MilestoneChecklistQuickViewScreen from '../../screens/MilestoneChecklistScreen/MilestoneChecklistQuickViewScreen';
import {useGetChecklistQuestions} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';

const Stack = createStackNavigator<MilestoneCheckListParamList>();

const MilestoneChecklistStack: React.FC<{}> = () => {
  // const {data: {answeredQuestionsCount, questionsGrouped} = {}} = useGetChecklistQuestions();
  // const {data: {id: childId} = {}} = useGetCurrentChild();
  //
  // useEffect(() => {
  //   if (answeredQuestionsCount === 0) {
  //     // setSection(undefined);
  //     // setGotStarted(false);
  //   }
  //   if (answeredQuestionsCount && answeredQuestionsCount > 0) {
  //     // setSection(sections[0]);
  //   }
  // }, [answeredQuestionsCount, childId]);

  return (
    <Stack.Navigator screenOptions={sharedScreenOptions}>
      <Stack.Screen
        name={'MilestoneChecklistGetStarted'}
        component={MilestoneChecklistGetStartedScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklistQuickView'}
        component={MilestoneChecklistQuickViewScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
      <Stack.Screen
        name={'MilestoneChecklist'}
        component={MilestoneChecklistScreen}
        options={() => ({
          headerLeft: () => <BurgerButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default MilestoneChecklistStack;
