import crashlytics from '@react-native-firebase/crashlytics';
import {formatISO, fromUnixTime, parseISO} from 'date-fns';
import _ from 'lodash';
import {useCallback} from 'react';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {queryCache} from 'react-query';

import {sqLiteClient} from '../db';
import SQLiteClient from '../db/SQLiteClient';
import {questionIdToMilestoneIdMap} from '../resources/milestoneChecklist';
import {objectToQuery} from '../utils/helpers';
import Storage from '../utils/Storage';
import {useSetAppointmentNotifications, useSetMilestoneNotifications} from './notificationsHooks';

type ChildIOSDB = {
  id: number;
  name: string;
  dateOfBirth: number;
  gender: 0 | 1 | number;
  doctorName?: string;
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
      const migrated = await Storage.getItemTyped('migrationStatus');

      if (migrated) {
        return;
      }

      const dbName = Platform.select({
        ios: 'act_early',
        android: 'com.brainbytescreative.actearly.database',
      });

      const childrenQueryStatement = Platform.select({
        ios: `
            SELECT id,
                   name,
                   dateOfBirth,
                   gender,
                   doctorName,
                   parentName,
                   parentEmail,
                   doctorEmail
            FROM Children
        `,
        android: `
            SELECT _id 'id', name, birth_date / 1000 'dateOfBirth', gender
            FROM children
        `,
      });

      const appointmentsQueryStatement = Platform.select({
        ios: `
            SELECT apptDate 'date', N.noteContent 'notes'
            FROM Appointments apt
                     LEFT JOIN Notes N ON apt.noteId = N.id
            WHERE apt.childId = ?1`,
        android: `
            SELECT date / 1000 'date', note 'notes'
            FROM appointments
            WHERE child_id = ?1
        `,
      });

      const milestonesQueryStatement = Platform.select({
        ios: `
            SELECT CASE ma.answer WHEN 3 THEN 0 ELSE ma.answer END 'answer',
                   mq.questionId,
                   n.noteContent                                   'note'
            FROM MilestonesAnswers ma
                     LEFT JOIN Notes n ON n.id = ma.noteId
                     INNER JOIN MilestonesQuestions mq ON ma.questionId = mq.id
            WHERE childId = ?
        `,
        android: `
            SELECT milestone_id                              'questionId',
                   CASE status WHEN 3 THEN 0 ELSE status END 'answer',
                   note
            FROM achievements
            WHERE child_id = ?
        `,
      });

      const dbPath = Platform.select({
        ios: dbName,
        android: ['..', 'databases', dbName].join('/'),
      });

      if (!dbName || !childrenQueryStatement || !milestonesQueryStatement || !appointmentsQueryStatement || !dbPath) {
        throw new Error('Platform is not supported');
      }

      const oldDbExists = await RNFS.exists([RNFS.DocumentDirectoryPath, dbPath].join('/'));

      if (!oldDbExists) {
        await Storage.setItemTyped('migrationStatus', 'notRequired');
        return;
      }

      const oldDbClient = await new SQLiteClient(dbName, []).connect({readOnly: true});

      const res = await oldDbClient.executeSql(childrenQueryStatement);
      const children: ChildIOSDB[] = (res && res[0].rows.raw()) || [];

      const childrenRecords = children.map(({dateOfBirth, ...rest}) => ({
        birthday: formatISO(fromUnixTime(Math.floor(dateOfBirth)), {representation: 'date'}),
        ...rest,
      }));

      await Promise.all(
        childrenRecords.map(async (record) => {
          const query = objectToQuery(_.omit(record, 'id'), 'children');
          const [{insertId: newChildId}] = await sqLiteClient.db.executeSql(query[0], query[1]);

          if (!newChildId) {
            throw new Error('Child import failed');
          }

          await setMilestoneNotifications({
            child: {...record, isPremature: false, id: newChildId, birthday: parseISO(record.birthday)},
          });

          const [{rows: aptRows}] = await oldDbClient.executeSql(appointmentsQueryStatement, [record.id]);

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

          const [{rows: milestoneAnswersOldRes}] = await oldDbClient.executeSql(milestonesQueryStatement, [record.id]);

          const milestoneAnswersOldRecords: MilestoneAnswerOld[] = milestoneAnswersOldRes.raw();

          await Promise.all(
            milestoneAnswersOldRecords.map(async (value) => {
              const milestoneId = questionIdToMilestoneIdMap.get(value.questionId);
              if (!milestoneId) {
                return;
              }
              const object = {...value, childId: newChildId, milestoneId: milestoneId};
              const [milestonesQuery, params] = objectToQuery(object, 'milestones_answers');

              await sqLiteClient.dB?.executeSql(milestonesQuery, params);
            }),
          );
        }),
      );

      await queryCache.invalidateQueries(['appointment']);
      await Storage.setItemTyped('migrationStatus', 'done');
    } catch (e) {
      crashlytics().log(JSON.stringify(questionIdToMilestoneIdMap));
      crashlytics().recordError(e);
      await Storage.setItemTyped('migrationStatus', 'error');
    }
  }, [setAppointmentNotifications, setMilestoneNotifications]);

  return [func];
}
