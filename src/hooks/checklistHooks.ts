import {useTranslation} from 'react-i18next';
import {differenceInDays, differenceInMonths, parseISO} from 'date-fns';
import _ from 'lodash';
import {childAges, missingConcerns, SkillType, skillTypes, tooYongAgeDays} from '../resources/constants';
import {useGetCurrentChild} from './childrenHooks';
import {queryCache, useMutation, useQuery} from 'react-query';
import milestoneChecklist, {
  Concern,
  MilestoneChecklist,
  Milestones,
  SkillSection,
} from '../resources/milestoneChecklist';
import {sqLiteClient} from '../db';
import {useMemo} from 'react';
import {tOpt} from '../utils/helpers';

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

type QuestionAnswerKey = Partial<Pick<MilestoneAnswer, 'childId' | 'questionId'>>;

interface ConcernAnswer {
  concernId: number;
  childId: number;
  answer: boolean;
  note?: string | undefined | null;
}

export function useGetMilestone() {
  const {data: child} = useGetCurrentChild();
  const {t} = useTranslation('common');

  return useQuery(['milestone', {child}], async (key, variables) => {
    if (!variables.child) {
      return;
    }
    let milestoneAge;
    let isTooYong = false;
    const betweenCheckList = false;

    const birthDay =
      typeof variables.child.birthday === 'string' ? parseISO(variables.child?.birthday) : variables.child?.birthday;

    if (birthDay) {
      const ageMonth = differenceInMonths(new Date(), birthDay);
      const minAge = _.min(childAges) || 0;
      const maxAge = _.max(childAges) || Infinity;

      if (ageMonth <= minAge) {
        milestoneAge = minAge;
        const ageDays = differenceInDays(new Date(), birthDay);
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
    };
  });
}

async function getAnswers(ids: number[], childId: number): Promise<MilestoneAnswer[] | undefined> {
  const result = await sqLiteClient.dB?.executeSql(
    `select * from milestones_answers where childId=? and questionId in (${ids.join(',')})`,
    [childId],
  );

  return result && result[0].rows.raw();
}

export function useGetChecklistQuestions() {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {data: child} = useGetCurrentChild();
  const {t} = useTranslation('milestones');

  return useQuery(
    ['questions', {childId: child?.id, milestoneAge}],
    async (key, variables) => {
      if (!variables.childId || !variables.milestoneAge) {
        return;
      }
      const checklist = _.find(milestoneChecklist, {id: variables.milestoneAge}) as MilestoneChecklist | undefined;
      const questionsData: ChecklistData[] | undefined =
        variables.milestoneAge &&
        (_.chain(skillTypes)
          .map(
            (section: keyof Milestones) =>
              checklist?.milestones && checklist?.milestones[section]?.map((i: any) => ({...i, section})),
          )
          .flatten()
          .map((item: SkillSection) => ({
            ...item,
            value: item.value && t(item.value, tOpt({t, gender: child?.gender})),
          }))
          .value() as any);

      const ids = questionsData && questionsData.map((i) => i.id || 0);
      const data = (child?.id && ids && (await getAnswers(ids, child?.id))) || [];

      data.forEach((value) => {
        queryCache.setQueryData(['question', {childId: value.childId, questionId: value.questionId}], value);
      });

      const answersIds = data.map((value) => value.questionId || 0);

      const groupedBySection = _.groupBy(questionsData, 'section');
      const questionsGrouped: Map<SkillType, SkillSection[]> = skillTypes.reduce((prev, section) => {
        prev.set(
          section,
          groupedBySection[section]
            .filter((item) => item.section === section)
            .sort((a) => {
              if (a.id && !answersIds.includes(a.id)) {
                return -1;
              }
              return 1;
            }),
        );

        return prev;
      }, new Map());

      const total = questionsData?.length || 0;
      const done = data?.length || 0;

      const questionsById = new Map<string, SkillSection>(Object.entries(_.keyBy(questionsData, 'id')));
      const answersById = new Map<string, MilestoneAnswer>(Object.entries(_.keyBy(data, 'questionId')));

      questionsById.forEach((value, mKey, map) => map.set(mKey, {...map.get(mKey), ...answersById.get(mKey)}));
      const groupedByAnswer = _.groupBy(Array.from(questionsById.values()), 'answer');

      return {
        questions: questionsData as ChecklistData[],
        totalProgress: `${done}/${total}`,
        totalProgressValue: done / total,
        answers: data,
        questionsIds: ids,
        child,
        questionsGrouped,
        groupedByAnswer,
        answeredQuestionsCount: answersIds.length,
      };
    },
    {
      staleTime: Infinity,
    },
  );
}

export function useGetCheckListAnswers(ids?: number[], childId?: number) {
  return useQuery(['answers', {ids, childId}], async (key, variables) => {
    const answers =
      (variables.childId && variables.ids && (await getAnswers(variables.ids, variables.childId))) || undefined;
    const complete = answers && variables.ids && answers.length === variables.ids.length;
    return {answers, complete};
  });
}

export function useGetSectionsProgress() {
  const {data: checkListData} = useGetChecklistQuestions();
  const questions = checkListData?.questions;
  const childId = checkListData?.child?.id;
  const {data: {answers, complete} = {}} = useGetCheckListAnswers(
    questions?.map((value) => value.id || 0),
    childId,
  );

  const progress: Map<SkillType, {total: number; answered: number}> | undefined = useMemo(() => {
    if (questions?.length) {
      return skillTypes.reduce((previousValue, section) => {
        const sectionsQuestions = questions.filter((value) => value.section === section);
        const questionsIds = sectionsQuestions.map((value) => value.id);
        const answeredInSection = answers?.filter((value) => questionsIds.includes(value.questionId)) || [];
        previousValue.set(section, {total: sectionsQuestions.length, answered: answeredInSection.length});
        return previousValue;
      }, new Map<SkillType, {total: number; answered: number}>());
    }
  }, [answers, questions]);

  return {progress, complete};
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

export function useSetQuestionAnswer() {
  return useMutation<void, MilestoneAnswer>(
    async (variables) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  INSERT OR REPLACE
                  INTO milestones_answers (childId, questionId, answer, note)
                  VALUES (?1, ?2, ?3, ?4)
        `,
        [variables.childId, variables.questionId, variables.answer, variables.note],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }

      return;
    },
    {
      throwOnError: false,
      onSuccess: (data, {childId, questionId}) => {
        queryCache.refetchQueries(['question', {childId, questionId}], {force: true});
        queryCache.refetchQueries('answers', {force: true});
      },
    },
  );
}

export function useGetConcerns() {
  const {data: {id: childId, gender} = {}} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {t} = useTranslation('milestones');

  // console.log({childId, milestoneAge, gender});

  return useQuery(
    ['concerns', {childId, milestoneAge, gender}],
    async (key, variables) => {
      // console.log(variables);
      if (!variables.childId || !variables.milestoneAge || variables.gender === undefined) {
        return;
      }
      const result = await sqLiteClient.dB?.executeSql('select * from concern_answers where childId=?', [
        variables.childId,
      ]);

      const answers: ConcernAnswer[] | undefined = result && result[0].rows.raw();

      answers?.forEach((value) => {
        queryCache.setQueryData(['concern', {childId: value.childId, concernId: value.concernId}], value);
      });

      const concernsData: Concern[] = _.chain(milestoneChecklist)
        .find({id: milestoneAge})
        .get('concerns')
        .map((item) => {
          return {
            ...item,
            value: item.value && t(item.value, tOpt({t, gender: variables.gender})),
          };
        })
        .value();

      const answeredIds = answers?.map((value) => value.concernId);

      const concernDataById = new Map(Object.entries(_.keyBy(concernsData, 'id')));
      const concerned = answers
        ?.filter((val) => val?.answer)
        .reduce((prev, value) => {
          const current = value?.concernId && concernDataById.get(`${value?.concernId}`);
          if (current) {
            return [...prev, current];
          }
          return prev;
        }, new Array<Concern>());

      concernsData
        ?.filter((value) => value.id && !answeredIds?.includes(value.id))
        ?.forEach((value) => {
          queryCache.setQueryData(['concern', {childId: variables.childId, concernId: value.id}], {
            childId: variables.childId,
            concernId: value.id,
            answered: false,
          });
        });

      const missingId = _.intersection(missingConcerns, concernsData?.map((value) => value.id || 0) || [])[0];

      return {concerns: concernsData, concerned, missingId};
    },
    {
      staleTime: 0,
    },
  );
}

type ConcernPredicate = Partial<Pick<ConcernAnswer, 'childId' | 'concernId'>>;

export function useGetConcern(predicate: ConcernPredicate) {
  return useQuery<ConcernAnswer, [string, typeof predicate]>(['concern', predicate], async (key, variables) => {
    const result = await sqLiteClient.dB?.executeSql('select * from concern_answers where concernId=? and childId=?', [
      variables.concernId,
      variables.childId,
    ]);

    return result && result[0].rows.item(0);
  });
}

export function useSetConcern() {
  return useMutation<void, ConcernAnswer>(
    async (variables) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  INSERT OR
                  REPLACE
                  INTO concern_answers (concernId, answer, note, childId)
                  VALUES (?1, ?2, ?3, ?4)
        `,
        [variables.concernId, variables.answer || false, variables.note, variables.childId],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }
    },
    {
      onSuccess: (data, {childId, concernId}) => {
        // const predicate = {childId, concernId};
        // console.log(predicate, answer);
        queryCache.refetchQueries(['concern', {childId, concernId}], {force: true});
      },
    },
  );
}