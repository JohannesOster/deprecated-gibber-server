import {v4 as uuid} from 'uuid';
import {createUsername} from 'domain/valueObjects';

export type User = {
  getUserId: () => string;
  getUsername: () => string;
};

type InitialValues = {
  userId?: string;
  username: string;
};
export const createUser = (init: InitialValues): User => {
  const {userId = uuid()} = init;

  const username = createUsername(init.username);

  const getUserId = () => userId;
  const getUsername = () => username.value();

  return {getUsername, getUserId};
};
