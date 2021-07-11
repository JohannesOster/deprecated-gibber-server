import {RoomsRepository} from './rooms';
import {UsersRepository} from './users';
import db from './db';

const repositories = {
  rooms: RoomsRepository(),
  users: UsersRepository(db),
};

repositories.users.createTable();

export default repositories;
