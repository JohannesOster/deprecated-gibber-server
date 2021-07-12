import {initializeDatabaseConnection} from './db';
import {RoomsRepository, UsersRepository} from './repositories';

export type DBAccess = {
  rooms: ReturnType<typeof RoomsRepository>;
  users: ReturnType<typeof UsersRepository>;
};

export const initializeDatabase = async () => {
  return initializeDatabaseConnection().then((models) => {
    const repositories = {
      rooms: RoomsRepository(models),
      users: UsersRepository(models),
    };

    return repositories;
  });
};
