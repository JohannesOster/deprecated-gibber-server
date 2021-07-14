import {createClient} from 'redis';
import {UsersRepository} from './repositories';
import {RoomsRepository} from './repositories/rooms';
import {DBAccess} from './types';

export const db = {
  init: (): Promise<DBAccess> => {
    const connectionString = 'redis://127.0.0.1:6379';
    const client = createClient(connectionString);

    return Promise.all([UsersRepository(client), RoomsRepository(client)]).then(
      ([users, rooms]) => ({
        users,
        rooms,
      }),
    );
  },
};
