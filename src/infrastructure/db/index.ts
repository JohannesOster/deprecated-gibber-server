import {initializeDatabaseConnection} from './db';
import {RoomsRepository, UsersRepository} from './repositories';
import {getSQL} from './sql';

export type DBAccess = {
  rooms: ReturnType<typeof RoomsRepository>;
  users: ReturnType<typeof UsersRepository>;
};

export const initializeDatabase = async () => {
  return initializeDatabaseConnection().then((db) => {
    const repositories = {
      rooms: RoomsRepository(db),
      users: UsersRepository(db),
    };

    // db.run(getSQL('createTables.sql'))
    //   .then(() => {
    //     console.log('Successfully created tables.');
    //   })
    //   .catch(console.error);

    return repositories;
  });
};
