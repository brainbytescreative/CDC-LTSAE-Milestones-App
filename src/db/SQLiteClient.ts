import {Platform} from 'react-native';
/**
 * Utility module providing modern inteface to Redis client
 * @module src/util/SQLiteClient
 */
import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

type Migration = (db: SQLiteDatabase) => Promise<void>;

SQLite.enablePromise(true);

/** Database downgrade error */
export class DowngradeError extends Error {
  constructor() {
    super();
    this.name = 'DowngradeError';
  }
}

/** Interface to SQLiteClient client. */
export default class SQLiteClient {
  private privateConnected = false;
  private name: string;
  private migrations: Migration[];
  private privateDb: SQLiteDatabase | null = null;

  constructor(name: string, migrations: Migration[], debug?: boolean) {
    this.name = name;
    this.migrations = migrations;
    if (debug === true) {
      SQLite.DEBUG(debug);
    }
  }

  public get connected(): boolean {
    return this.privateConnected;
  }

  public get dB(): SQLiteDatabase | null {
    return this.privateDb;
  }

  /**
   * @type {SQLiteDatabase}
   * @throws if database is not connected
   */
  public get db(): SQLiteDatabase {
    if (!this.privateDb) {
      throw new Error('Db is not connected');
    }
    return this.privateDb;
  }

  public async connect(options?: Pick<SQLite.DatabaseParams, 'readOnly'>): Promise<SQLiteDatabase> {
    if (this.privateConnected && this.privateDb) {
      return this.privateDb;
    }
    try {
      this.privateDb = await SQLite.openDatabase({
        name: this.name,
        location: Platform.select({
          ios: 'Documents',
          default: 'default',
        }),
        ...(options?.readOnly && {readOnly: options.readOnly}),
      });

      // MIGRATIONS
      if (this.migrations.length) {
        const resultSet = await this.privateDb.executeSql('PRAGMA user_version');
        const version: number = resultSet[0].rows.item(0).user_version;
        const nextVersion = this.migrations.length;
        if (version > nextVersion) {
          throw new DowngradeError();
        }
        for (let i = version; i < nextVersion; i += 1) {
          const migration = this.migrations[i];
          await migration(this.privateDb);
        }
        if (version !== nextVersion) {
          await this.privateDb.executeSql(`PRAGMA user_version = ${nextVersion}`);
        }
      }

      this.privateConnected = true;
      return this.privateDb;
    } catch (err) {
      if (err instanceof DowngradeError) {
        throw err;
      }
      throw new Error(`SQLiteClient: failed to connect to database: ${this.name}`);
    }
  }
}
