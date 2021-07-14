import {v4 as uuid} from 'uuid';
import {createUsername} from 'domain/valueObjects';

export type User = {
  getUserId: () => string;
  getUsername: () => string;
  getScore: () => number;
};

type InitialValues = {
  userId?: string;
  username: string;
  score?: number;
};
export const createUser = (init: InitialValues): User => {
  const {userId = uuid(), score = 0} = init;

  const username = createUsername(init.username);

  const getUserId = () => userId;
  const getUsername = () => username.value();
  const getScore = () => score;

  return {getUsername, getUserId, getScore};
};
