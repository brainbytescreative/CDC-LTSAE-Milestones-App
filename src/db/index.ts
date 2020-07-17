/**
 * Utility module providing initialized global variables.
 * @module src/util/global
 */
import {SQLiteDatabase} from 'react-native-sqlite-storage';

import SQLiteClient from './SQLiteClient';

const DB_NAME = 'act-early-rn.sqlite';
const DB_DEBUG = false;
const DB_MIGRATIONS = [
  async (dB: SQLiteDatabase): Promise<void> => {
    // USE dB TO CREATE TABLES
    await dB.executeSql(`
        CREATE TABLE children
        (
            id          integer NOT NULL
                PRIMARY KEY AUTOINCREMENT
                UNIQUE,
            name        text    NOT NULL,
            birthday    date    NOT NULL,
            gender      integer NOT NULL,
            doctorName  text,
            parentName  text,
            parentEmail text,
            doctorEmail text,
            photo       text
        );
    `);

    await dB.executeSql(`
        CREATE TABLE appointments
        (
            id         integer NOT NULL
                PRIMARY KEY AUTOINCREMENT
                UNIQUE,
            childId    integer
                REFERENCES children (id)
                    ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
            date       datetime NOT NULL,
            notes      text,
            apptType   text    NOT NULL,
            doctorName text,
            questions  text
        );
    `);

    await dB.executeSql(`
        CREATE TABLE milestones_answers
        (
            childId     integer NOT NULL
                REFERENCES children (id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
            questionId  integer NOT NULL,
            milestoneId integer NOT NULL,
            answer      integer,
            note        text,
            PRIMARY KEY (childId, questionId, milestoneId)
        );
    `);

    await dB.executeSql(`
        CREATE TABLE concern_answers
        (
            answer      boolean NOT NULL,
            note        text,
            concernId   integer NOT NULL,
            milestoneId integer NOT NULL,
            childId     integer NOT NULL
                REFERENCES Children (id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
            PRIMARY KEY (concernId, childId, milestoneId)
        );
    `);

    await dB.executeSql(`
        CREATE TABLE tips_status
        (
            hintId   integer NOT NULL,
            childId  integer NOT NULL
                REFERENCES children (id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
            like     boolean,
            remindMe boolean,
            PRIMARY KEY (hintId, childId)
        );
    `);

    await dB.executeSql(`
        CREATE TABLE milestone_got_started
        (
            childId     int,
            milestoneId int
        );
    `);
    await dB.executeSql(`
        CREATE TABLE notifications
        (
            notificationId           text     NOT NULL
                PRIMARY KEY,
            fireDateTimestamp        datetime NOT NULL,
            notificationRead         boolean  NOT NULL DEFAULT FALSE,
            notificationCategoryType integer  NOT NULL,
            childId                  integer,
            milestoneId              integer,
            appointmentId            integer,
            bodyArguments            text,
            bodyLocalizedKey         text,
            titleLocalizedKey        text
        );
    `);
  },
];

/** Application's SQLite client */
export const sqLiteClient = new SQLiteClient(DB_NAME, DB_MIGRATIONS, DB_DEBUG);

/** Applicaiton initialization. */
export const initialize = async (): Promise<SQLiteDatabase> => {
  return sqLiteClient.connect();
};

// /* eslint-disable @typescript-eslint/no-unused-vars */
// import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';
// import {Platform} from 'react-native';
//
// SQLite.enablePromise(true);
//
// let db: SQLiteDatabase;
//
// interface Child {
//   id: string;
//   name: string;
//   birth_date: number;
//   gender: number;
// }
//
// export default class Database {
//   public static async connect() {
//     switch (Platform.OS) {
//       case 'ios':
//         db = await SQLite.openDatabase({
//           location: 'Documents',
//           name: 'act_early',
//         });
//         break;
//       case 'android':
//         db = await SQLite.openDatabase({
//           location: 'default',
//           name: 'com.brainbytescreative.actearly.database',
//         });
//         break;
//       default: {
//         throw new Error('Platform is not supported');
//       }
//     }
//   }
//
//   public static getAllChildren() {
//     return db
//       .executeSql('SELECT * FROM children')
//       .then((value) => value[0].rows.raw() as Child[]);
//   }
//
//   private static checkIfTableExist(name: string) {
//     return db
//       .executeSql('SELECT lower(name) FROM sqlite_master where name = ?', [
//         name.toLowerCase(),
//       ])
//       .then((value) => value[0].rows.length > 0);
//   }
//
//   public static async checkVersion() {
//     const versionExists = await this.checkIfTableExist('version');
//
//     if (!versionExists) {
//       switch (Platform.OS) {
//         case 'ios':
//           break;
//         case 'android':
//           const childrenExists = await this.checkIfTableExist('children');
//
//           if (childrenExists) {
//             await db.executeSql(`
//               alter table children rename column _id to id;
//               alter table children rename column birth_date to "dateOfBirth";
//               alter table children add column doctorName text;
//               alter table children add column parentName text;
//               alter table children add column parentEmail text;
//               alter table children add column doctorEmail text;
// `);
//           }
//
//           const achievementsExists = await this.checkIfTableExist(
//             'achievements',
//           );
//           const agesExists = await this.checkIfTableExist('ages');
//           const androidMetadataExists = await this.checkIfTableExist(
//             'android_metadata',
//           );
//           const appointmentsExists = await this.checkIfTableExist(
//             'appointments',
//           );
//           const childConcernExists = await this.checkIfTableExist(
//             'child_concern',
//           );
//           const concernExists = await this.checkIfTableExist('concern');
//           const hintsExists = await this.checkIfTableExist('hints');
//           const metricsExists = await this.checkIfTableExist('metrics');
//           const milestoneExists = await this.checkIfTableExist('milestone');
//           const notificationsExists = await this.checkIfTableExist(
//             'notifications',
//           );
//
//           break;
//         default: {
//           throw new Error('Platform is not supported');
//         }
//       }
//     }
//
//     // console.log();
//     // if (res && res?.length ==0 ) {
//     // }
//   }
// }
