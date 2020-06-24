import SQLiteClient from '../db/SQLiteClient';
import milestoneChecklist, {milestoneQuestions} from '../resources/milestoneChecklist';
import {formatISO, fromUnixTime, parseISO} from 'date-fns';
import {useCallback} from 'react';
import {sqLiteClient} from '../db';
import {objectToQuery} from '../utils/helpers';
import _ from 'lodash';
import {useSetAppointmentNotifications, useSetMilestoneNotifications} from './notificationsHooks';
import {queryCache} from 'react-query';
import crashlytics from '@react-native-firebase/crashlytics';

type ChildIOSDB = {
  id: number;
  name: string;
  dateOfBirth: number;
  gender: 0 | 1 | number;
  doctorName: string;
  parentName?: string;
  parentEmail?: string;
  doctorEmail?: string;
};

type AppointmentIOSDB = {
  date: number | null;
  notes: string | null;
};

type MilestoneAnswerOld = {
  answer: number;
  questionId: number;
  note: string | null;
};

export function useTransferDataFromOldDb() {
  const [setMilestoneNotifications] = useSetMilestoneNotifications();
  const [setAppointmentNotifications] = useSetAppointmentNotifications();

  const func = useCallback(async () => {
    try {
      const oldDbClient = await new SQLiteClient('act_early', []).connect();

      const res = await oldDbClient.executeSql('SELECT * FROM Children');
      const children: ChildIOSDB[] = (res && res[0].rows.raw()) || [];

      const childrenRecords = children.map(({dateOfBirth, ...rest}) => ({
        birthday: formatISO(fromUnixTime(Math.floor(dateOfBirth))),
        ...rest,
      }));

      await Promise.all(
        childrenRecords.map(async (record) => {
          const query = objectToQuery(_.omit(record, 'id'), 'children');
          const [{insertId: newChildId}] = await sqLiteClient.db.executeSql(query[0], query[1]);

          if (!newChildId) {
            throw new Error('Child import failed');
          }

          await setMilestoneNotifications({child: {...record, id: newChildId, birthday: parseISO(record.birthday)}});

          const [{rows: aptRows}] = await oldDbClient.executeSql(
            `
                      SELECT apptDate 'date', N.noteContent 'notes'
                      FROM Appointments apt
                               LEFT JOIN Notes N ON apt.noteId = N.id
                      WHERE apt.childId = ?1`,
            [record.id],
          );

          const aptRecords: AppointmentIOSDB[] = aptRows.raw();
          await Promise.all(
            aptRecords.map(async ({date, notes}) => {
              const newApt = {
                date: formatISO(fromUnixTime(Math.floor(date || 0))),
                notes,
                childId: newChildId,
                apptType: `${record.name}`,
              };

              const [queryText, params] = objectToQuery(newApt, 'appointments');
              const [{insertId}] = await sqLiteClient.db.executeSql(queryText, params);

              await setAppointmentNotifications({appointmentId: insertId});
            }),
          );

          const [{rows: milestoneAnswersOldRes}] = await oldDbClient.executeSql(
            `
                      SELECT CASE ma.answer WHEN 3 THEN 0 ELSE ma.answer END 'answer',
                             mq.questionId,
                             n.noteContent                                   'note',
                             ma.childId
                      FROM MilestonesAnswers ma
                               LEFT JOIN Notes n ON n.id = ma.noteId
                               INNER JOIN MilestonesQuestions mq ON ma.questionId = mq.id
                      WHERE childId = ?
            `,
            [record.id],
          );

          const milestoneAnswersOldRecords: MilestoneAnswerOld[] = milestoneAnswersOldRes.raw();

          await Promise.all(
            milestoneAnswersOldRecords.map(async (value) => {
              const question = _.find(milestoneQuestions, {
                id: value.questionId,
              });
              if (!question?.milestoneId) {
                return;
              }
              const object = {...value, childId: newChildId, milestoneId: question.milestoneId};
              const [milestonesQuery, params] = objectToQuery(object, 'milestones_answers');

              await sqLiteClient.dB?.executeSql(milestonesQuery, params);
            }),
          );
        }),
      );

      await queryCache.refetchQueries(['appointment'], {force: true});
    } catch (e) {
      crashlytics().recordError(e);
    } finally {
    }
  }, [setAppointmentNotifications, setMilestoneNotifications]);

  return [func];
}
