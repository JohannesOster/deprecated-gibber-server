import {RoomsRepository} from './rooms';
import {UsersRepository} from './users';

export default {
  rooms: RoomsRepository(),
  users: UsersRepository(),
};
