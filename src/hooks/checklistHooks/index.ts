import {parseISO} from 'date-fns';
import * as MailComposer from 'expo-mail-composer';
import i18next from 'i18next';
import _ from 'lodash';
import nunjucks from 'nunjucks';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {queryCache, useMutation, useQuery} from 'react-query';

import {sqLiteClient} from '../../db';
import {getChecklistAnswer, setAnswer} from '../../db/checklistQueries';
import {
  MilestoneIdType,
  PropType,
  Section,
  SkillType,
  milestonesIds,
  missingConcerns,
  skillTypes,
} from '../../resources/constants';
import emailSummaryContent from '../../resources/EmailChildSummary';
import {Concern, SkillSection, checklistMap} from '../../resources/milestoneChecklist';
import {calcChildAge, checkMissingMilestones, formatDate, formattedAge, tOpt} from '../../utils/helpers';
import {useGetCurrentChild} from '../childrenHooks';
// noinspection ES6PreferShortImport
import {useGetChild} from '../childrenHooks/useGetChild';
import {
  useDeleteRecommendationNotifications,
  useSetCompleteMilestoneReminder,
  useSetRecommendationNotifications,
} from '../notificationsHooks';
import {
  Answer,
  ChildResult,
  MilestoneAnswer,
  MilestoneQueryKey,
  MilestoneQueryResult,
  QuestionAnswerKey,
} from '../types';
import useSetMilestoneAge from './useSetMilestoneAge';

// type ChecklistData = SkillSection & {section: keyof Milestones};

interface ConcernAnswer {
  concernId: number;
  milestoneId: number;
  childId: number;
  answer?: boolean;
  note?: string | undefined | null;
}

export function useGetMilestone(childId?: ChildResult['id']) {
  const {data: currentChild} = useGetCurrentChild();
  const {data: child} = useGetChild({id: childId});
  const {t} = useTranslation('common');

  const selectedChild = child ?? currentChild;
  console.log(selectedChild?.id, childId, 'useGetMilestone');
  return useQuery<MilestoneQueryResult, MilestoneQueryKey>(
    ['milestone', {childBirthday: selectedChild?.birthday, childId: selectedChild?.id}],
    async (key, variables) => {
      if (!variables.childBirthday) {
        return;
      }

      const birthDay =
        typeof variables.childBirthday === 'string' ? parseISO(variables.childBirthday) : variables.childBirthday;

      const {milestoneAge, isTooYong, betweenCheckList} = calcChildAge(birthDay);

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
    {
      enabled: Boolean(selectedChild),
    },
  );
}

async function getAnswers(milestoneId: number, childId: number): Promise<MilestoneAnswer[]> {
  const result = await sqLiteClient.dB?.executeSql(
    `SELECT *
     FROM milestones_answers
     WHERE childId = ?1
       AND milestoneId = ?2`,
    [childId, milestoneId],
  );

  return (result && result[0].rows.raw()) ?? [];
}

export function useGetChecklistQuestions(childId?: ChildResult['id']) {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {data: currentChild} = useGetCurrentChild();
  const {data: anotherChild} = useGetChild({id: childId});
  const {t} = useTranslation('milestones');
  const child = anotherChild || currentChild;
  const enabled = Boolean(milestoneAge && child);

  return useQuery(
    ['questions', {childId: child?.id, childGender: child?.gender, milestoneAge}],
    async (key, variables) => {
      if (!variables.childId || !variables.milestoneAge) {
        return;
      }

      const data = await getAnswers(variables.milestoneAge, variables.childId);
      const answersIds = data.map((value) => value.questionId);

      const questionsData =
        checklistMap
          .get(variables.milestoneAge)
          ?.milestones?.map((item) => {
            // const value =
            //   item.value && __DEV__
            //     ? [
            //         t(item.value, {lng: 'en', ...tOpt({t, gender: variables.childGender})}),
            //         t(item.value, {lng: 'es', ...tOpt({t, gender: variables.childGender})}),
            //       ].join('\n\n')
            //     : t(item.value, tOpt({t, gender: variables.childGender}));

            const value = t(item.value, tOpt({t, gender: variables.childGender}));
            return {
              ...item,
              value: _.trim(value, '.'),
            };
          })
          ?.sort((a, b) => {
            const aIsAnswered = answersIds.includes(a.id);
            const bIsAbswered = answersIds.includes(b.id);
            if (aIsAnswered && !bIsAbswered) {
              return 1;
            } else if (bIsAbswered && !aIsAnswered) {
              return -1;
            } else {
              return 0;
            }
          }) ?? [];

      data.forEach((value) => {
        queryCache.setQueryData(
          ['question', {childId: value.childId, questionId: value.questionId, milestoneId: milestoneAge}],
          value,
        );
      });

      const questionsGrouped = new Map(Object.entries(_.groupBy(questionsData, 'skillType')));
      const total = questionsData?.length || 0;
      const done = data?.length || 0;
      const questionsById = new Map<string, SkillSection>(Object.entries(_.keyBy(questionsData, 'id')));
      const answersById = new Map<string, MilestoneAnswer>(Object.entries(_.keyBy(data, 'questionId')));

      questionsById.forEach((value, mKey, map) => map.set(mKey, {...map.get(mKey)!, ...answersById.get(mKey)}));
      const groupedByAnswer: Record<
        Answer | 'undefined' | string,
        {id: number; value?: string; note: string}[]
      > = _.groupBy(Array.from(questionsById.values()), 'answer') as any;

      groupedByAnswer.undefined = Array.from(_.merge(groupedByAnswer.undefined, groupedByAnswer.null));

      return {
        questions: questionsData,
        totalProgress: `${done}/${total}`,
        totalProgressValue: done / total,
        answers: data,
        questionsGrouped,
        groupedByAnswer,
        answeredQuestionsCount: answersIds.length,
      };
    },
    {
      enabled,
    },
  );
}

export function useGetCheckListAnswers(milestoneId?: number, childId?: number) {
  const enabled = Boolean(milestoneId && childId);

  return useQuery(
    ['answers', {milestoneId, childId}],
    async () => {
      const answers = await getAnswers(milestoneId!, childId!);
      console.log({milestoneId, childId}, '<<<<useGetCheckListAnswers');

      const questions = checklistMap.get(Number(milestoneId))?.milestones ?? [];
      const questionsIds = questions.map((value) => value.id);
      const answerIds = answers?.map((value) => value.questionId) || [];
      const unansweredIds = _.difference(questionsIds, answerIds);
      const unansweredData = questions.filter((value) => unansweredIds.includes(value.id));

      const complete = unansweredIds.length === 0; //answers && variables.ids && answers.length === variables.ids.length;
      return {answers, complete, unansweredData};
    },
    {
      enabled,
    },
  );
}

// todo: It could be improved
export function useGetSectionsProgress(childId: PropType<ChildResult, 'id'> | undefined) {
  const {data: {questionsGrouped} = {}} = useGetChecklistQuestions();
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data: {answers, complete} = {}} = useGetCheckListAnswers(milestoneId, childId);
  const hasNotYet = !!answers && !!answers.length && answers?.filter((val) => val.answer === Answer.NOT_YET).length > 0;

  const progress: Map<Section, {total: number; answered: number}> | undefined = useMemo(() => {
    if (questionsGrouped && answers) {
      return skillTypes.reduce((previousValue, section) => {
        const sectionsQuestions = questionsGrouped?.get(section) || [];
        const questionsIds = sectionsQuestions.map((value) => value.id);
        const answeredInSection = answers.filter((value) => questionsIds.includes(value.questionId)) || [];
        previousValue.set(section, {total: sectionsQuestions.length, answered: answeredInSection.length});
        return previousValue;
      }, new Map<SkillType, {total: number; answered: number}>());
    }
  }, [answers, questionsGrouped]);

  return {progress, complete, hasNotYet};
}

export function useGetQuestionAnswer(data: QuestionAnswerKey) {
  const enabled = Boolean(data.milestoneId && data.childId && data.questionId);

  return useQuery<MilestoneAnswer | undefined, [string, typeof data]>(
    ['question', data],
    async (key, variables) => getChecklistAnswer(variables),
    {
      enabled,
    },
  );
}

export function useSetQuestionAnswer() {
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const [checkMissing] = useCheckMissingMilestones();
  const [setReminder] = useSetCompleteMilestoneReminder();

  return useMutation<void, MilestoneAnswer>(
    async (variables) => {
      const {answer, childId, note, questionId, milestoneId} = variables;
      queryCache.setQueryData(['question', {childId, questionId, milestoneId}], variables);
      await setAnswer({childId, questionId, answer, milestoneId, note});
    },
    {
      throwOnError: false,
      onSuccess: async (data, {childId, questionId, milestoneId, answer}) => {
        checkMissing({childId, milestoneId});
        // queryCache.invalidateQueries(['question', {childId, questionId, milestoneId}]).then();
        // todo optimistic
        await queryCache.invalidateQueries('answers', {exact: false, refetchInactive: true, refetchActive: true});
        if (milestoneAge) {
          await queryCache.invalidateQueries(['monthProgress', {childId, milestone: milestoneAge}], {
            refetchActive: true,
          });
        } else {
          await queryCache.invalidateQueries('monthProgress', {
            refetchActive: true,
          });
        }
        // const prevAnswer = await getAnswerValue({childId, milestoneId, questionId});
        // if (prevAnswer !== answer) {
        await setReminder({childId, questionId, milestoneId, answer});
        // }
      },
    },
  );
}

type Concerned = Concern & Pick<ConcernAnswer, 'note'>;

export function useGetConcerns(childId?: PropType<ChildResult, 'id'>) {
  const {data: {id: currentChildId, gender} = {}} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone(childId);
  const {t} = useTranslation('milestones');
  const childIdResult = childId ?? currentChildId;
  const enabled = Boolean(childIdResult && Number(milestoneAge) > 0);

  return useQuery(
    ['concerns', {childId: childIdResult, milestoneAge, gender}],
    async (key, variables) => {
      // console.log(variables);
      if (!variables.childId || !variables.milestoneAge || variables.gender === undefined) {
        return;
      }

      // __DEV__ && (await slowdown(Promise.resolve(), 3000));

      const result = await sqLiteClient.dB?.executeSql('SELECT * FROM concern_answers WHERE childId=?', [
        variables.childId,
      ]);

      const answers: ConcernAnswer[] | undefined = result && result[0].rows.raw();

      answers?.forEach((value) => {
        queryCache.setQueryData(
          ['concern', {childId: value.childId, concernId: value.concernId, milestoneId: variables.milestoneAge}],
          value,
        );
      });

      const concernsData: Concern[] =
        checklistMap.get(Number(milestoneAge))?.concerns?.map((item) => {
          return {
            ...item,
            value: item.value && _.trim(t(item.value, tOpt({t, gender: variables.gender})), '.'),
          };
        }) ?? [];

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
        ?.map((value) => {
          queryCache.setQueryData(
            ['concern', {childId: variables.childId, concernId: value.id, milestoneId: variables.milestoneAge}],
            {
              childId: variables.childId,
              concernId: value.id,
              answered: false,
              milestoneId: milestoneAge,
            },
          );
        });

      const missingId = _.intersection(missingConcerns, concernsData?.map((value) => value.id || 0) || [])[0];
      return {concerns: concernsData, concerned, missingId, answers};
    },
    {
      staleTime: 0,
      enabled,
    },
  );
}

type ConcernPredicate = Partial<Pick<ConcernAnswer, 'childId' | 'concernId' | 'milestoneId'>>;

export function useGetConcern(predicate: ConcernPredicate) {
  return useQuery<ConcernAnswer, [string, typeof predicate]>(
    ['concern', predicate],
    async (key, variables) => {
      const [result] = await sqLiteClient.db.executeSql(
        'select * from concern_answers where concernId=? and childId=?',
        [variables.concernId, variables.childId],
      );

      return result.rows.item(0);
    },
    {
      enabled: Boolean(predicate.childId && predicate.milestoneId && predicate.concernId),
      suspense: false,
    },
  );
}

export function useSetConcern() {
  const [checkMissing] = useCheckMissingMilestones();
  const [setRecommendationNotifications] = useSetRecommendationNotifications();
  const [deleteRecommendationNotifications] = useDeleteRecommendationNotifications();

  return useMutation<void, ConcernAnswer>(
    async ({answer, childId, concernId, milestoneId, note}) => {
      const result = await sqLiteClient.dB?.executeSql(
        `
            INSERT OR
            REPLACE
            INTO concern_answers (concernId, answer, childId, milestoneId, note)
            VALUES (?1, coalesce(?2,
                                 coalesce((SELECT answer FROM concern_answers WHERE concernId = ?1 AND childId = ?3),
                                          0)), ?3, ?4,
                    ${
                      note === undefined
                        ? 'COALESCE(?5, (SELECT note FROM concern_answers WHERE concernId = ?1 AND childId = ?3))'
                        : '?5'
                    })
        `,
        [concernId, answer, childId, milestoneId, note],
      );

      if (!result || result[0].rowsAffected === 0) {
        throw new Error('Update failed');
      }
    },
    {
      onSuccess: async (data, {childId, concernId, milestoneId}) => {
        // const predicate = {childId, concernId};
        // console.log(predicate, answer);
        await queryCache.invalidateQueries(['concern', {childId, concernId, milestoneId}], {exact: true});
        const {isMissingConcern} = await checkMissing({childId, milestoneId});
        if (isMissingConcern) {
          await setRecommendationNotifications({milestoneId, child: {id: childId}});
        } else {
          await deleteRecommendationNotifications({milestoneId, childId});
        }
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

  const enabled = Boolean(milestoneAge && child);

  return useQuery<Tip[], [string, {milestoneAge?: number; childId?: number}]>(
    ['tips', {milestoneAge, childId: child?.id}],
    async (key, variables) => {
      if (!variables.milestoneAge || !variables.childId) {
        return;
      }

      const tips = checklistMap.get(Number(milestoneAge))?.helpful_hints?.map((item) => ({
        ...item,
        key: item.value,
        value: item.value && t(`milestones:${item.value}`, tOpt({t, gender: child?.gender})),
      }));

      const tipsIds = tips?.map((value) => value.id) || [0].join(',');
      const result = await sqLiteClient.dB?.executeSql(
        `select *
         from tips_status
         where childId = ?
           and hintId in (${tipsIds})`,
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
    {
      enabled,
    },
  );
}

export function useGetTipValue(variables: {childId?: number; hintId?: number}) {
  return useQuery<Pick<Tip, 'remindMe' | 'like'> | undefined, [string, typeof variables]>(
    ['tip', {childId: variables.childId, hintId: variables.hintId}],
    async () => {
      const result = await sqLiteClient.dB?.executeSql('SELECT * FROM tips_status WHERE childId=? AND hintId =?', [
        variables.childId,
        variables.hintId,
      ]);

      return result && result[0].rows.item(0);
    },
    {
      enabled: Boolean(variables.childId && variables.hintId),
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
        queryCache.invalidateQueries('tips');
      },
    },
  );
}

export function useGetMonthProgress(predicate: {childId?: number; milestone?: number}) {
  const enabled = Boolean(predicate.childId && predicate.milestone);

  return useQuery<number, [string, typeof predicate]>(
    ['monthProgress', predicate],
    async (key, variables) => {
      if (!variables.childId || !variables.milestone) {
        return 0;
      }
      const questions = checklistMap.get(variables.milestone)?.milestones;
      const result = await sqLiteClient.dB?.executeSql(
        'SELECT count(questionId) cnt FROM milestones_answers WHERE milestoneId=?1 AND childId=?2',
        [variables.milestone, variables.childId],
      );

      const answeredQuestionsCount = result?.[0].rows.item(0)?.cnt ?? 0;
      return (answeredQuestionsCount / Number(questions?.length)) * 100 ?? 0;
    },
    {
      enabled,
    },
  );
}

export function useGetMilestoneGotStarted(predicate: {childId?: number; milestoneId?: number}) {
  const enabled = Boolean(predicate.childId && predicate.milestoneId);
  return useQuery(
    ['milestoneGotStarted', predicate],
    async (key, {childId, milestoneId}) => {
      if (!childId || !milestoneId) {
        return false;
      }
      const result = await sqLiteClient.dB?.executeSql(
        'SELECT * FROM milestone_got_started WHERE childId=? AND milestoneId=? LIMIT 1',
        [childId, milestoneId],
      );

      return !!result && result[0].rows.length > 0;
    },
    {staleTime: 0, enabled},
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
  const {data: {milestoneAge} = {}, status: milestoneStatus} = useGetMilestone(childData?.id);
  const {t} = useTranslation('childSummary');

  return {
    compose: () => {
      const {milestoneAgeFormatted} = formattedAge(Number(milestoneAge), t, true);
      const body = nunjucks.renderString(emailSummaryContent[i18next.language]!, {
        childName: childData?.name || child?.name,
        concerns: concerns?.concerned ?? [],
        skippedItems: data?.groupedByAnswer[`${undefined}`] ?? [],
        yesItems: data?.groupedByAnswer['0'] ?? [],
        notSureItems: data?.groupedByAnswer['1'] ?? [],
        notYetItems: data?.groupedByAnswer['2'] ?? [],
        formattedAge: milestoneAgeFormatted,
        isPremature: Number(child?.weeksPremature) >= 4 && Number(milestoneAge) < 24,
        currentDayText: formatDate(new Date(), 'date'),
        ...tOpt({t, gender: childData?.gender || child?.gender}),
      });

      console.log(data?.groupedByAnswer[`${undefined}`]?.length, data?.groupedByAnswer['1']?.length, body);

      return MailComposer.composeAsync({
        isHtml: true,
        body: body,
      });
    },
    loading: !(concernsStatus === 'success' && questionsStatus === 'success' && milestoneStatus === 'success'),
  };
}

export function useGetIsMissingMilestone({milestoneId, childId}: {milestoneId?: number; childId?: number}) {
  return useQuery(
    ['isMissingMilestones', {milestoneId, childId}],
    async (key, variables) => {
      if (variables.milestoneId && variables.childId) {
        return checkMissingMilestones(variables.milestoneId, variables.childId);
      }
      return;
    },
    {suspense: false},
  );
}

export function useCheckMissingMilestones() {
  return useMutation(
    async ({childId, milestoneId}: {childId: number; milestoneId: number}) => {
      const {isMissingConcern, isNotYet, isNotSure} = await checkMissingMilestones(milestoneId, childId);
      const concernId = missingConcerns[milestonesIds.indexOf(milestoneId as MilestoneIdType)];
      if ((isMissingConcern || isNotYet) && concernId !== undefined) {
        await sqLiteClient.dB?.executeSql(
          `
              INSERT OR
              REPLACE
              INTO concern_answers (answer, concernId, milestoneId, childId, note)
              VALUES (1, ?1, ?2, ?3, (SELECT note
                                      FROM concern_answers
                                      WHERE concernId = ?1
                                        AND childId = ?3
                                        AND milestoneId = ?2))
          `,
          [concernId, milestoneId, childId],
        );
      } else if (concernId !== undefined) {
        await sqLiteClient.dB?.executeSql(
          `
              INSERT OR
              REPLACE
              INTO concern_answers (answer, concernId, milestoneId, childId, note)
              VALUES (0, ?1, ?2, ?3, (SELECT note
                                      FROM concern_answers
                                      WHERE concernId = ?1
                                        AND childId = ?3
                                        AND milestoneId = ?2))
          `,
          [concernId, milestoneId, childId],
        );
      }

      return {isMissingConcern, isNotYet, isNotSure};
    },
    {
      onSuccess: async (data, {milestoneId, childId}) => {
        await Promise.all(
          missingConcerns.map((concernId) => {
            return queryCache.invalidateQueries(['concern', {childId, concernId, milestoneId}]);
          }),
        );
        queryCache.invalidateQueries('isMissingMilestones');
      },
    },
  );
}

export {useSetMilestoneAge};
