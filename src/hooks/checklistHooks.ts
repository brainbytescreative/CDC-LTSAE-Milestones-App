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

export interface MilestoneAnswer {
  childId: number;
  questionId: number;
  answer?: Answer;
  note?: string | undefined | null;
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
    let milestoneAgeFormattedDashes;

    if (milestoneAge) {
      milestoneAgeFormatted =
        milestoneAge % 12 === 0 ? t('year', {count: milestoneAge / 12}) : t('month', {count: milestoneAge});
      milestoneAgeFormattedDashes =
        milestoneAge % 12 === 0 ? t('yearDash', {count: milestoneAge / 12}) : t('monthDash', {count: milestoneAge});
    }

    return {
      milestoneAge,
      milestoneAgeFormatted,
      milestoneAgeFormattedDashes,
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
      const groupedByAnswer: Record<string, {id: number; value?: string; note: string}[]> = _.groupBy(
        Array.from(questionsById.values()),
        'answer',
      ) as any;

      groupedByAnswer.undefined = _.merge(groupedByAnswer.undefined, groupedByAnswer.null);

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

  const hasNotYet = !!answers && !!answers.length && answers?.filter((val) => val.answer === Answer.NOT_YET).length > 0;

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

  return {progress, complete, hasNotYet};
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
  const {data: {milestoneAge} = {}} = useGetMilestone();

  return useMutation<void, MilestoneAnswer>(
    async (variables) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  INSERT OR REPLACE
                  INTO milestones_answers (childId, questionId, answer, note)
                  VALUES (?1, ?2, ?3, COALESCE(?4, (SELECT note FROM milestones_answers WHERE questionId = ?2 and childId = ?1)))
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
        queryCache.refetchQueries(['question', {childId, questionId}], {force: true}).then();
        queryCache.refetchQueries('answers', {force: true, exact: false}).then();
        if (milestoneAge) {
          queryCache.refetchQueries(['monthProgress', {childId, milestone: milestoneAge}], {force: true}).then();
        } else {
          queryCache.refetchQueries('monthProgress', {force: true}).then();
        }
      },
    },
  );
}

type Concerned = Concern & Pick<ConcernAnswer, 'note'>;

export function useGetConcerns() {
  const {data: {id: childId, gender} = {}} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {t} = useTranslation('milestones');

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
          const current = value?.concernId ? concernDataById.get(`${value?.concernId}`) : undefined;
          if (current) {
            return [...prev, {...current, note: value.note}];
          }
          return prev;
        }, new Array<Concerned>());

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
      return {concerns: concernsData, concerned, missingId, answers};
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
                  INTO concern_answers (concernId, answer, childId, note)
                  VALUES (?1, ?2, ?3,
                          COALESCE(?4, (SELECT note FROM concern_answers WHERE concernId = ?1 and childId = ?3)))
        `,
        [variables.concernId, variables.answer || false, variables.childId, variables.note],
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

export interface Tip {
  childId?: number;
  hintId?: number;
  id?: number;
  like?: number;
  remindMe?: number;
  value?: string;
}

export function useGetTips() {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {t} = useTranslation('milestones');
  const {data: child} = useGetCurrentChild();
  useMemo(
    () =>
      milestoneChecklist
        .filter((value) => value.id === milestoneAge)[0]
        ?.helpful_hints?.map((item) => ({
          ...item,
          value: item.value && t(`${item.value}`, tOpt({t, gender: child?.gender})),
        })),
    [milestoneAge, t, child],
  );

  return useQuery<Tip[], [string, {milestoneAge?: number; childId?: number}]>(
    ['tips', {milestoneAge, childId: child?.id}],
    async (key, variables) => {
      if (!variables.milestoneAge || !variables.childId) {
        return;
      }

      const tips = milestoneChecklist
        .filter((value) => value.id === milestoneAge)[0]
        ?.helpful_hints?.map((item) => ({
          ...item,
          value: item.value && t(`milestones:${item.value}`, tOpt({t, gender: child?.gender})),
        }));

      const tipsIds = tips?.map((value) => value.id) || [0].join(',');

      const result = await sqLiteClient.dB?.executeSql(
        `select * from tips_status where childId=? and hintId in (${tipsIds})`,
        [variables.childId],
      );

      const resultData = (result && result[0].rows.raw()) || [];

      const merged = _.merge(_.keyBy(tips, 'id'), _.keyBy(resultData, 'hintId'));
      const mergedArray = Array.from(new Map(Object.entries(merged)).values()) as any;
      mergedArray.forEach((value: Tip) =>
        queryCache.setQueryData(['tip', {childId: variables.childId, hintId: value.id}], value),
      );
      return mergedArray;
    },
  );
}

export function useGetTipValue(variables: {childId?: number; hintId?: number}) {
  return useQuery<Pick<Tip, 'remindMe' | 'like'> | undefined, [string, typeof variables]>(
    ['tip', {childId: variables.childId, hintId: variables.hintId}],
    async () => {
      const result = await sqLiteClient.dB?.executeSql('select * from tips_status where childId=? and hintId =?', [
        variables.childId,
        variables.hintId,
      ]);

      return result && result[0].rows.item(0);
    },
  );
}

export function useSetTip() {
  return useMutation<void, {childId: number; hintId: number; like?: boolean; remindMe?: boolean}>(async (variables) => {
    const key: any = ['tip', {childId: variables.childId, hintId: variables.hintId}];
    const cache = queryCache.getQueryData(key) as Tip | undefined;

    const data = _.pick({...cache, ...variables}, ['hintId', 'childId', 'like', 'remindMe']);

    if (cache) {
      queryCache.setQueryData(key, {...cache, like: data.like, remindMe: data.remindMe});
    }

    const query = `
                INSERT OR
                REPLACE
                INTO tips_status (${Object.keys(data).join(',')})
                VALUES (${Object.keys(data)
                  .map((value, index) => `?${index + 1}`)
                  .join(',')})
      `;

    const result = await sqLiteClient.dB?.executeSql(query, Object.values(data));
    if (!result || result[0].rowsAffected === 0) {
      throw new Error('Update failed');
    }
  });
}

export function useGetMonthProgress(predicate: {childId?: number; milestone?: number}) {
  return useQuery<number, [string, typeof predicate]>(['monthProgress', predicate], async (key, variables) => {
    if (!variables.childId || !variables.milestone) {
      return 0;
    }
    const milestoneEntries = new Map(
      Object.entries(milestoneChecklist.filter((value) => value.id === variables.milestone)[0].milestones || {}),
    );
    const molestoneQuestionsIds = (Array.from(milestoneEntries.values()).flat() as SkillSection[]).map(
      (value) => value.id,
    );
    const result = await sqLiteClient.dB?.executeSql(
      `SELECT count(questionId) cnt from milestones_answers where questionId in (${molestoneQuestionsIds.join(',')})`,
    );

    const answeredQuestionsCount = (result && result[0].rows.item(0).cnt) || 0;
    return (answeredQuestionsCount / (molestoneQuestionsIds.length || 1)) * 100;
  });
}

export function useGetMilestoneGotStarted(predicate: {childId?: number; milestoneId?: number}) {
  return useQuery(
    ['milestoneGotStarted', predicate],
    async (key, {childId, milestoneId}) => {
      if (!childId || !milestoneId) {
        return false;
      }
      const result = await sqLiteClient.dB?.executeSql(
        'SELECT * from milestone_got_started where childId=? and milestoneId=?',
        [childId, milestoneId],
      );

      return !!result && result[0].rows.length > 0;
    },
    {staleTime: 0},
  );
}

export function useSetMilestoneGotStarted() {
  return useMutation<void, {childId?: number; milestoneId?: number}>(async ({childId, milestoneId}) => {
    if (!childId || !milestoneId) {
      return;
    }

    await sqLiteClient.dB?.executeSql(
      'insert or replace into milestone_got_started (childId, milestoneId) values (?,?)',
      [childId, milestoneId],
    );
  });
}
