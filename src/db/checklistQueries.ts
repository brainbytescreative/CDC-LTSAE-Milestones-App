import {Answer, MilestoneAnswer, QuestionAnswerKey} from '../hooks/types';
import {sqLiteClient} from './index';

export async function getChecklistAnswer(variables: QuestionAnswerKey): Promise<MilestoneAnswer | undefined> {
  const result = await sqLiteClient.db.executeSql(
    'SELECT * FROM milestones_answers WHERE childId=?1 AND questionId = ?2 AND milestoneId = ?3 LIMIT 1',
    [variables.childId, variables.questionId, variables.milestoneId],
  );

  return result[0].rows.item(0);
}

export async function getAnswerValue(
  params: Required<Pick<MilestoneAnswer, 'childId' | 'milestoneId' | 'questionId'>>,
): Promise<Answer | undefined> {
  const prevAnswerRes = await sqLiteClient.db.executeSql(
    `
          SELECT answer
          FROM milestones_answers
          WHERE childId = ?1
            AND milestoneId = ?2
            AND questionId = ?3
          LIMIT 1
      `,
    [params.childId, params.milestoneId, params.questionId],
  );
  return prevAnswerRes[0].rows.item(0)?.answer as Answer;
}

export async function setAnswer(params: MilestoneAnswer): Promise<void> {
  const result = await sqLiteClient.db.executeSql(
    `
                  INSERT OR
                  REPLACE
                  INTO milestones_answers (childId, questionId, answer, milestoneId, note)
                  VALUES (?1, ?2, ?3, ?4,
                          COALESCE(?5, (SELECT note FROM milestones_answers WHERE questionId = ?2 AND childId = ?1)))
        `,
    [params.childId, params.questionId, params.answer, params.milestoneId, params.note],
  );

  if (!result || result[0].rowsAffected === 0) {
    throw new Error('Insert/Update failed');
  }
}
