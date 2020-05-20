/**
 * Utility module providing initialized global variables.
 * @module src/util/global
 */
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import SQLiteClient from './SQLiteClient';

const DB_NAME = 'act-early-rn.sqlite';
const DB_DEBUG = true;
const DB_MIGRATIONS = [
  async (dB: SQLiteDatabase): Promise<void> => {
    // USE dB TO CREATE TABLES
    await dB.executeSql(`
        create table children
        (
            id          INTEGER not null
                primary key autoincrement
                unique,
            name        TEXT    not null,
            birthday    DATE    not null,
            gender      INTEGER not null,
            doctorName  TEXT,
            parentName  TEXT,
            parentEmail TEXT,
            doctorEmail TEXT,
            photo       TEXT
        );
    `);

    await dB.executeSql(`
        create table appointments
        (
            id         INTEGER not null
                primary key autoincrement
                unique,
            childId    INTEGER
                references children (id)
                    on update cascade on delete cascade,
            date   DATETIME,
            notes      TEXT,
            apptType   TEXT not null,
            doctorName TEXT,
            questions  TEXT
        );
    `);

    await dB.executeSql(`
        create table milestones_answers
        (
            childId    INTEGER not null
                references children (id)
                    on update cascade on delete cascade,
            questionId INTEGER not null,
            answer     INTEGER,
            note       TEXT,
            PRIMARY KEY (childId, questionId)
        );
    `);

    await dB.executeSql(`
        create table concern_answers
        (
            concernId INTEGER not null,
            answer    BOOLEAN not null,
            note      TEXT,
            childId   INTEGER not null
                references Children (id)
                    on update cascade on delete cascade,
            primary key (concernId, childId)
        );
    `);

    await dB.executeSql(`
        create table tips_status
        (
            hintId   INTEGER not null,
            childId  INTEGER not null
                references Children (id)
                    on update cascade on delete cascade,
            like     BOOLEAN,
            remindMe BOOLEAN,
            primary key (hintId, childId)
        );
    `);

    await dB.executeSql(`
        create table milestone_got_started
        (
            childId     int,
            milestoneId int
        );
    `);
  },
];

/** Application's SQLite client */
export const sqLiteClient = new SQLiteClient(DB_NAME, DB_MIGRATIONS, DB_DEBUG);

/** Applicaiton initialization. */
export const initialize = async (): Promise<void> => {
  await sqLiteClient.connect();
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
