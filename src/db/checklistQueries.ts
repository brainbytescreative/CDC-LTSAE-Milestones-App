import {MilestoneAnswer, QuestionAnswerKey} from '../hooks/types';
import {sqLiteClient} from './index';

export async function getChecklistAnswer(variables: QuestionAnswerKey): Promise<MilestoneAnswer | undefined> {
  const result = await sqLiteClient.db.executeSql(
    'SELECT * FROM milestones_answers WHERE childId=?1 AND questionId = ?2 AND milestoneId = ?3 LIMIT 1',
    [variables.childId, variables.questionId, variables.milestoneId],
  );

  return result[0].rows.item(0);
}
