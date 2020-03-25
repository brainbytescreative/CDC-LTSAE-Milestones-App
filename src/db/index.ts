import SQLite, {SQLError, SQLiteDatabase} from 'react-native-sqlite-storage';
import {Platform} from 'react-native';

SQLite.enablePromise(true);

let db: SQLiteDatabase | undefined;

interface Child {
    _id: string;
    name: string;
    birth_date: number;
    gender: number;
}

export default class Database {
    public static async connect() {
        switch (Platform.OS) {
            case 'ios':
                db = await SQLite.openDatabase({
                    location: 'Documents',
                    name: 'act_early',
                });
                break;
            case 'android':
                db = await SQLite.openDatabase({
                    location: 'default',
                    name: 'com.brainbytescreative.actearly.database',
                });
                break;
            default: {
                throw new Error('Platform is not supported');
            }
        }
    }

    public static getAllChildren() {
        return db?.executeSql('SELECT * FROM children').then(value => value[0].rows.raw() as Child[])
    }
}
