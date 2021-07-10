import {RoomsRepository} from './rooms';
import {UsersRepository} from './users';
import {verbose} from 'sqlite3';

const sqlite = verbose();
export let db = new sqlite.Database('./src/infrastructure/db/sqlite.db');

export default {
  rooms: RoomsRepository(),
  users: UsersRepository(),
};
