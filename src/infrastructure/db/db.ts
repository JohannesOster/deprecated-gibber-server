import {UsersRepository, RoomsRepository} from './repositories';
import {DBAccess, Database} from './types';

const createDB = (): Database => {
  const data: any = {};

  return {
    get: <T>(key: string) => {
      return new Promise<T | undefined>((resolve, reject) => {
        const result = data[key];
        if (!result) return resolve(undefined);
        resolve(JSON.parse(result) as T);
      });
    },
    set: <T>(key: string, value: T) => {
      return new Promise((resolve, reject) => {
        data[key] = JSON.stringify(value);
        resolve(undefined);
      });
    },
    del: (key: string) => {
      return new Promise((resolve, reject) => {
        delete data[key];
        resolve(undefined);
      });
    },
  };
};

export const db = {
  init: (): Promise<DBAccess> => {
    const _db = createDB();

    return Promise.resolve({
      users: UsersRepository(_db),
      rooms: RoomsRepository(_db),
    });
  },
};
