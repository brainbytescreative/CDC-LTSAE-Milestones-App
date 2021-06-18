import i18next from 'i18next';
import _ from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import NoteIcon from '../../components/Svg/NoteIcon';
import withSuspense from '../../components/withSuspense';
import {useGetMilestone, useGetQuestionAnswer, useSetQuestionAnswer} from '../../hooks/checklistHooks';
import {Answer} from '../../hooks/types';
import {SkillSection} from '../../resources/checklist-types';
import {colors, sharedStyle} from '../../resources/constants';
import {trackChecklistAnswer, trackInteractionByType} from '../../utils/analytics';

const QuestionItem: React.FC<SkillSection & {childId: number | undefined}> = ({id, value, childId}) => {
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data, isFetching} = useGetQuestionAnswer({
    childId: childId || 0,
    questionId: id || 0,
    milestoneId: milestoneId || 0,
  });
  const [answerQuestion] = useSetQuestionAnswer();
  const [note, setNote] = useState('');
  const answer = data?.answer;
  const {t} = useTranslation('milestones');

  const doAnswer = (answerValue: Answer) => () => {
    id &&
      childId &&
      milestoneId &&
      answerQuestion({questionId: id, childId, answer: answerValue, note: note, milestoneId});
    if (answerValue !== answer) {
      trackChecklistAnswer(answerValue, {questionData: {milestoneId: Number(milestoneId), questionId: id}});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveNote = useCallback(
    _.debounce((text: string) => {
      id &&
        childId &&
        milestoneId &&
        answerQuestion({questionId: id, answer: data?.answer, childId, note: text, milestoneId});
      trackInteractionByType('Add Milestone Note');
    }, 500),
    [id, childId, milestoneId, data?.answer],
  );

  useEffect(() => {
    !isFetching && setNote(data?.note || '');
  }, [data, isFetching]);

  return (
    <View style={{flex: 1, marginTop: 38, marginHorizontal: 32}}>
      <View style={{backgroundColor: colors.purple, borderRadius: 10, overflow: 'hidden', paddingBottom: 30}}>
        <Text style={{margin: 15, textAlign: 'center', fontSize: 15}}>{value}</Text>
      </View>
      <View style={[styles.buttonsContainer]}>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.YES,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.YES)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.YES ? {backgroundColor: colors.lightGreen} : undefined,
          ]}>
          <Text numberOfLines={1}>{t('milestoneChecklist:answer_yes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.UNSURE,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.UNSURE)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            {marginHorizontal: 8},
            answer === Answer.UNSURE ? {backgroundColor: colors.yellow} : undefined,
          ]}>
          {i18next.language === 'es' ? (
            <Text style={{width: 70, textAlign: 'center'}} numberOfLines={2}>
              {t('milestoneChecklist:answer_unsure')}
            </Text>
          ) : (
            <Text numberOfLines={1}>{t('milestoneChecklist:answer_unsure')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.NOT_YET,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.NOT_YET)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.NOT_YET ? {backgroundColor: colors.tanHide} : undefined,
          ]}>
          <Text numberOfLines={1} adjustsFontSizeToFit>
            {t('milestoneChecklist:answer_not_yet')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.addNoteContainer, sharedStyle.shadow]}>
        <TextInput
          value={note}
          onChange={(e) => {
            setNote(e.nativeEvent.text);
            saveNote(e.nativeEvent.text);
          }}
          multiline
          style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, minHeight: 43, margin: 1}}
          placeholder={t('milestoneChecklist:addANoteLong')}
        />
        <NoteIcon style={{marginLeft: 10}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -30,
  },
  answerButton: {
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderColor: colors.gray,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  addNoteContainer: {
    marginTop: 15,
    minHeight: 50,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    flexGrow: 1,
    // width: 0,
    paddingHorizontal: 17,
    paddingVertical: 10,
    maxHeight: 100,
  },
});

export default withSuspense(
  QuestionItem,
  {
    shared: {
      suspense: true,
    },
  },
  <View
    style={{
      borderRadius: 10,
      backgroundColor: colors.purple,
      justifyContent: 'center',
      height: 300,
      flex: 1,
      marginHorizontal: 32,
      marginTop: 32,
    }}>
    <ActivityIndicator color={colors.white} size={'small'} />
  </View>,
);
