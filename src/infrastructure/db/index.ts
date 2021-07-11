import {initializeDatabaseConnection} from './db';
import {RoomsRepository, UsersRepository} from './repositories';

export type DBAccess = {
  rooms: ReturnType<typeof RoomsRepository>;
  users: ReturnType<typeof UsersRepository>;
};

export const initializeDatabase = async () => {
  return initializeDatabaseConnection().then((db) => {
    const repositories = {
      rooms: RoomsRepository(),
      users: UsersRepository(db),
    };

    repositories.users.createTable();

    return repositories;
  });
};
