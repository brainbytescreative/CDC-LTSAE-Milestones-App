import {useTranslation} from 'react-i18next';
import {parseISO} from 'date-fns';
import _ from 'lodash';
import {childAges, missingConcerns, PropType, SkillType, skillTypes} from '../resources/constants';
import {ChildResult, useGetChild, useGetCurrentChild} from './childrenHooks';
import {queryCache, useMutation, useQuery} from 'react-query';
import milestoneChecklist, {
  Concern,
  MilestoneChecklist,
  Milestones,
  SkillSection,
} from '../resources/milestoneChecklist';
import {sqLiteClient} from '../db';
import {useMemo} from 'react';
import {calcChildAge, formatDate, formattedAge, tOpt} from '../utils/helpers';
import * as MailComposer from 'expo-mail-composer';
import nunjucks from 'nunjucks';
import emailSummaryContent from '../resources/EmailChildSummary';

type ChecklistData = SkillSection & {section: keyof Milestones};

export enum Answer {
  YES,
  UNSURE,
  NOT_YET,
}

export interface MilestoneAnswer {
  childId: number;
  questionId: number;
  milestoneId: number;
  answer?: Answer;
  note?: string | undefined | null;
}

type QuestionAnswerKey = Partial<Pick<MilestoneAnswer, 'childId' | 'questionId'>>;

interface ConcernAnswer {
  concernId: number;
  milestoneId: number;
  childId: number;
  answer: boolean;
  note?: string | undefined | null;
}

type MilestoneQueryResult =
  | {
      milestoneAge: number | undefined;
      childAge: number | undefined;
      milestoneAgeFormatted: string | undefined;
      milestoneAgeFormattedDashes: string | undefined;
      isTooYong: boolean;
      betweenCheckList: boolean;
    }
  | undefined;

type MilestoneQueryKey = [string, {childBirthday?: Date}];

export function useGetMilestone(childId?: PropType<ChildResult, 'id'>) {
  const {data: currentChild} = useGetCurrentChild();
  const {data: child} = useGetChild({id: childId});
  const {t} = useTranslation('common');

  return useQuery<MilestoneQueryResult, MilestoneQueryKey>(
    ['milestone', {childBirthday: child?.birthday || currentChild?.birthday}],
    async (key, variables) => {
      if (!variables.childBirthday) {
        return;
      }
      const betweenCheckList = false;

      const birthDay =
        typeof variables.childBirthday === 'string' ? parseISO(variables.childBirthday) : variables.childBirthday;

      const {milestoneAge, isTooYong} = calcChildAge(birthDay);

      let milestoneAgeFormatted;
      let milestoneAgeFormattedDashes;

      if (milestoneAge) {
        const formatted = formattedAge(milestoneAge, t);
        milestoneAgeFormatted = formatted.milestoneAgeFormatted;
        milestoneAgeFormattedDashes = formatted.milestoneAgeFormattedDashes;
      }

      return {
        milestoneAge,
        childAge: milestoneAge,
        milestoneAgeFormatted,
        milestoneAgeFormattedDashes,
        isTooYong,
        betweenCheckList,
      };
    },
  );
}

export function useSetMilestoneAge() {
  const {t} = useTranslation('common');
  const {data: child} = useGetCurrentChild();
  return [
    (age: typeof childAges[number]) => {
      const {milestoneAge: childAge} = calcChildAge(child?.birthday);
      const formatted = formattedAge(age, t);
      const data: MilestoneQueryResult = {
        milestoneAge: age,
        ...formatted,
        childAge,
        isTooYong: false,
        betweenCheckList: false,
      };

      const key: MilestoneQueryKey = ['milestone', {childBirthday: child?.birthday}];
      queryCache.setQueryData(key, data);
    },
  ];
}

async function getAnswers(ids: number[], childId: number): Promise<MilestoneAnswer[] | undefined> {
  const result = await sqLiteClient.dB?.executeSql(
    `select * from milestones_answers where childId=? and questionId in (${ids.join(',')})`,
    [childId],
  );

  return result && result[0].rows.raw();
}

export function useGetChecklistQuestions(childId?: PropType<ChildResult, 'id'>) {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {data: currentChild} = useGetCurrentChild();
  const {data: anotherChild} = useGetChild({id: childId});
  const {t} = useTranslation('milestones');

  const child = anotherChild || currentChild;

  return useQuery(
    ['questions', {childId: child?.id, childGender: child?.gender, milestoneAge}],
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
            value: item.value && t(item.value, tOpt({t, gender: variables.childGender})),
          }))
          .value() as any);

      const ids = questionsData && questionsData.map((i) => i.id || 0);
      const data = (variables.childId && ids && (await getAnswers(ids, variables.childId))) || [];

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

export function useGetSectionsProgress(childId: PropType<ChildResult, 'id'> | undefined) {
  const {data: checkListData} = useGetChecklistQuestions();
  const questions = checkListData?.questions;
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
  const [checkMissing] = useCheckMissingMilestones();

  return useMutation<void, MilestoneAnswer>(
    async ({answer, childId, note, questionId, milestoneId}) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  INSERT OR
                  REPLACE
                  INTO milestones_answers (childId, questionId, answer, milestoneId, note)
                  VALUES (?1, ?2, ?3, ?4,
                          COALESCE(?5, (SELECT note FROM milestones_answers WHERE questionId = ?2 and childId = ?1)))
        `,
        [childId, questionId, answer, milestoneId, note],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }

      return;
    },
    {
      throwOnError: false,
      onSuccess: (data, {childId, questionId, milestoneId}) => {
        checkMissing({childId, milestoneId});
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

export function useGetConcerns(childId?: PropType<ChildResult, 'id'>) {
  const {data: {id: currentChildId, gender} = {}} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone(childId);
  const {t} = useTranslation('milestones');

  return useQuery(
    ['concerns', {childId: childId || currentChildId, milestoneAge, gender}],
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

type ConcernPredicate = Partial<Pick<ConcernAnswer, 'childId' | 'concernId' | 'milestoneId'>>;

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
  const [checkMissing] = useCheckMissingMilestones();

  return useMutation<void, ConcernAnswer>(
    async ({answer = false, childId, concernId, milestoneId, note}) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
                  INSERT OR
                  REPLACE
                  INTO concern_answers (concernId, answer, childId, milestoneId, note)
                  VALUES (?1, ?2, ?3, ?4,
                          COALESCE(?5, (SELECT note FROM concern_answers WHERE concernId = ?1 and childId = ?3)))
        `,
        [concernId, answer, childId, milestoneId, note],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }
    },
    {
      onSuccess: (data, {childId, concernId, milestoneId}) => {
        // const predicate = {childId, concernId};
        // console.log(predicate, answer);
        checkMissing({childId, milestoneId});
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
  key?: string;
}

export function useGetTips() {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {t} = useTranslation('milestones');
  const {data: child} = useGetCurrentChild();

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
          key: item.value,
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
  return useMutation<void, {childId: number; hintId: number; like?: boolean; remindMe?: boolean}>(
    async (variables) => {
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
    },
    {
      onSuccess: () => {
        queryCache.refetchQueries('tips', {force: true});
      },
    },
  );
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
      `SELECT count(questionId) cnt from milestones_answers where questionId in (${molestoneQuestionsIds.join(
        ',',
      )}) and childId=?`,
      [variables.childId],
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
        'SELECT * from milestone_got_started where childId=? and milestoneId=? limit 1',
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

    queryCache.setQueryData(['milestoneGotStarted', {childId, milestoneId}], true);

    await sqLiteClient.dB?.executeSql(
      'insert or replace into milestone_got_started (childId, milestoneId) values (?,?)',
      [childId, milestoneId],
    );
  });
}

export function useGetComposeSummaryMail(childData?: Partial<Pick<ChildResult, 'id' | 'name' | 'gender'>>) {
  const {data: child} = useGetCurrentChild();
  const {data: concerns, status: concernsStatus} = useGetConcerns(childData?.id);
  const {data, status: questionsStatus} = useGetChecklistQuestions(childData?.id);
  const {data: {milestoneAgeFormatted} = {}, status: milestoneStatus} = useGetMilestone(childData?.id);
  const {t} = useTranslation('childSummary');

  return {
    compose: () => {
      return MailComposer.composeAsync({
        isHtml: true,
        body: nunjucks.renderString(emailSummaryContent.en, {
          childName: childData?.name || child?.name,
          concerns: concerns?.concerned,
          skippedItems: data?.groupedByAnswer[`${undefined}`],
          yesItems: data?.groupedByAnswer['0'],
          notSureItems: data?.groupedByAnswer['1'],
          notYetItems: data?.groupedByAnswer['2'],
          formattedAge: milestoneAgeFormatted,
          currentDayText: formatDate(new Date(), 'date'),
          ...tOpt({t, gender: childData?.gender || child?.gender}),
        }),
      });
    },
    loading: !(concernsStatus === 'success' && questionsStatus === 'success' && milestoneStatus === 'success'),
  };
}

async function checkMissingMilestones(milestoneId: number, childId: number) {
  const notYetRes = await sqLiteClient.dB?.executeSql(
    'select questionId from milestones_answers where milestoneId=? and childId=? and answer=? limit 1',
    [milestoneId, childId, Answer.NOT_YET],
  );

  const concernsRes = await sqLiteClient.dB?.executeSql(
    `select concernId from concern_answers where concernId not in (${missingConcerns.join(
      ',',
    )}) and milestoneId=? and childId=? and answer=? limit 1`,
    [milestoneId, childId, 1],
  );

  const isMissingConcern = (concernsRes && concernsRes[0].rows.length > 0) || false;
  const isNotYet = (notYetRes && notYetRes[0].rows.length > 0) || false;
  return {isMissingConcern, isNotYet};
}

export function useGetIsMissingMilestone({milestoneId, childId}: {milestoneId?: number; childId?: number}) {
  return useQuery(['isMissingMilestones', {milestoneId, childId}], async (key, variables) => {
    if (variables.milestoneId && variables.childId) {
      return checkMissingMilestones(variables.milestoneId, variables.childId);
    }
    return;
  });
}

export function useCheckMissingMilestones() {
  return useMutation(
    async ({childId, milestoneId}: {childId: number; milestoneId: number}) => {
      const {isMissingConcern, isNotYet} = await checkMissingMilestones(milestoneId, childId);
      const concernId = missingConcerns[childAges.indexOf(milestoneId)];
      if ((isMissingConcern || isNotYet) && concernId !== undefined) {
        await sqLiteClient.dB?.executeSql(
          `
            insert or
            replace into concern_answers (answer, concernId, milestoneId, childId, note)
            VALUES (1, ?1, ?2, ?3, (SELECT note FROM concern_answers WHERE concernId = ?1 and childId = ?3 and milestoneId=?2))
        `,
          [concernId, milestoneId, childId],
        );
      } else if (concernId !== undefined) {
        await sqLiteClient.dB?.executeSql(
          `
            insert or
            replace into concern_answers (answer, concernId, milestoneId, childId, note)
            VALUES (0, ?1, ?2, ?3, (SELECT note FROM concern_answers WHERE concernId = ?1 and childId = ?3 and milestoneId=?2))
        `,
          [concernId, milestoneId, childId],
        );
      }

      return;
    },
    {
      onSuccess: async (data, {milestoneId, childId}) => {
        await Promise.all(
          missingConcerns.map((concernId) => {
            return queryCache.refetchQueries(['concern', {childId, concernId, milestoneId}], {force: true});
          }),
        );
        queryCache.refetchQueries('isMissingMilestones', {force: true});
      },
    },
  );
}
