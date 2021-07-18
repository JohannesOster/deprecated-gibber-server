import {createClient, RedisClient} from 'redis';
import {UsersRepository} from './repositories';
import {RoomsRepository} from './repositories/rooms';
import {DBAccess, Database} from './types';

const createDB = (client: RedisClient): Database => {
  return {
    get: <T>(key: string) => {
      return new Promise<T | undefined>((resolve, reject) => {
        client.get(key, (error, result) => {
          if (error) return reject(error);
          if (!result) return resolve(undefined);
          resolve(JSON.parse(result) as T);
        });
      });
    },
    set: <T>(key: string, value: T) => {
      return new Promise((resolve, reject) => {
        client.set(key, JSON.stringify(value), (error) => {
          if (error) return reject(error);
          resolve(undefined);
        });
      });
    },
  };
};

export const db = {
  init: (): Promise<DBAccess> => {
    const connectionString = 'redis://127.0.0.1:6379';
    const client = createClient(connectionString);
    const _db = createDB(client);

    return Promise.resolve({
      users: UsersRepository(_db),
      rooms: RoomsRepository(_db),
    });
  },
};
