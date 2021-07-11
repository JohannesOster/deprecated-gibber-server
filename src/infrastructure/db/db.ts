import {verbose} from 'sqlite3';

export interface Database {
  run: (sql: string, params?: any) => Promise<any>;
  many: (sql: string, params?: any) => Promise<any[]>;
}

export const initializeDatabaseConnection = async () => {
  const sqlite = verbose();
  const filePath = './src/infrastructure/db/sqlite.db';

  const db = new sqlite.Database(filePath, (error) => {
    if (error) throw error;
    console.log('Successfully connected to db at ', filePath);
  });

  const _all = (sql: string, params: any = []): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (error, rows) => {
        if (error) {
          console.error(`Error running sql ${sql}`);
          console.error(error);
          reject(error);
          return;
        }

        resolve(rows);
      });
    });
  };

  return {
    run: (sql: string, params: any = []) => {
      return _all(sql, params).then((result: any) => {
        if (!result.length) return;
        if (result.length === 1) return result[0];
        return result;
      });
    },

    many: (sql: string, params: any = []) => _all(sql, params),
  };
};
