import {useTranslation} from 'react-i18next';
import {differenceInDays, differenceInMonths} from 'date-fns';
import _ from 'lodash';
import {childAges, skillTypes, tooYongAgeDays} from '../resources/constants';
import {useGetCurrentChild} from './childrenHooks';
import {queryCache, useMutation, useQuery} from 'react-query';
import milestoneChecklist, {MilestoneChecklist, Milestones, SkillSection} from '../resources/milestoneChecklist';
import {sqLiteClient} from '../db';

export function useGetMilestone() {
  const {data: child, ...rest} = useGetCurrentChild();
  const {t} = useTranslation('common');

  let milestoneAge;
  let isTooYong = false;
  const betweenCheckList = false;
  if (child?.birthday) {
    const ageMonth = differenceInMonths(new Date(), child?.birthday);
    const minAge = _.min(childAges) || 0;
    const maxAge = _.max(childAges) || Infinity;

    if (ageMonth <= minAge) {
      milestoneAge = minAge;
      const ageDays = differenceInDays(new Date(), child?.birthday);
      isTooYong = ageDays < tooYongAgeDays;
    } else if (ageMonth >= maxAge) {
      milestoneAge = maxAge;
    } else {
      const milestones = childAges.filter((value) => value < ageMonth);
      milestoneAge = milestones[milestones.length - 1];
    }
  }

  let milestoneAgeFormatted;

  if (milestoneAge) {
    milestoneAgeFormatted =
      milestoneAge % 12 === 0 ? t('year', {count: milestoneAge / 12}) : t('month', {count: milestoneAge});
  }

  return {
    milestoneAge,
    milestoneAgeFormatted,
    isTooYong,
    betweenCheckList,
    child,
    ...rest,
  };
}

type ChecklistData = SkillSection & {section: keyof Milestones};

export enum Answer {
  YES,
  UNSURE,
  NOT_YET,
}

interface MilestoneAnswer {
  childId: number;
  questionId: number;
  answer: Answer;
  note?: string | undefined;
}

type QuestionsWithAnswers = ChecklistData & Omit<Partial<MilestoneAnswer>, 'id'>;

export function useGetChecklistQuestions() {
  const {child, milestoneAge} = useGetMilestone();
  const {t} = useTranslation('milestones');

  return useQuery(['questions', {childId: child?.id, milestoneAge}], async (key, variables) => {
    if (!variables.childId || !milestoneAge) {
      return;
    }

    const checklist = _.find(milestoneChecklist, {id: milestoneAge}) as MilestoneChecklist | undefined;
    const questionsData =
      milestoneAge &&
      (_.chain(skillTypes)
        .map(
          (section: keyof Milestones) =>
            checklist?.milestones && checklist?.milestones[section]?.map((i: any) => ({...i, section})),
        )
        .flatten()
        .map((item: SkillSection) => ({...item, value: item.value && t(item.value)}))
        .value() as any);

    const ids = questionsData?.map((i: any) => i.id).join(',');
    const result = await sqLiteClient.dB?.executeSql(
      `select * from milestones_answers where childId=? and questionId in (${ids})`,
      [variables.childId],
    );

    const data = result && (result[0].rows.raw() as MilestoneAnswer[]);

    data?.forEach((value) => {
      queryCache.setQueryData(['question', {childId: value.childId, questionId: value.questionId}], value);
    });

    return {
      questions: questionsData as ChecklistData,
    };
  });
}

export function useGetQuestion(data: QuestionAnswerKey) {
  return useQuery(['question', data], async (key, variables) => {
    if (!variables.childId || !variables.questionId) {
      throw new Error('No key');
    }

    const result = await sqLiteClient.dB?.executeSql(
      'select * from milestones_answers where childId=? and questionId = ?',
      [variables.childId, variables.questionId],
    );

    return result && (result[0].rows.item(0) as MilestoneAnswer);
  });
}

type QuestionAnswerKey = Partial<Pick<MilestoneAnswer, 'childId' | 'questionId'>>;

export function useSetQuestionAnswer() {
  return useMutation<void, MilestoneAnswer>(
    async (variables) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
        INSERT INTO milestones_answers (childId, questionId, answer, note)
        VALUES (?, ?, ?, ?)
        on conflict(childId, questionId) do update set answer= ?,
                                                       note=?
        where childId = ?
          and questionId = ?;`,
        [
          variables.childId,
          variables.questionId,
          variables.answer,
          variables.note,
          variables.answer,
          variables.note,
          variables.childId,
          variables.questionId,
        ],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }

      return;
    },
    {
      throwOnError: false,
      onSuccess: (data, {childId, questionId}) => {
        queryCache.refetchQueries(['question', {childId, questionId}]);
      },
    },
  );
}
