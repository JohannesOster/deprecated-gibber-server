import {v4 as uuid} from 'uuid';

export type User = {
  userId: string;
  username: string;
  addToScore: (roomId: string, val: number) => void;
  retrieveScore: (roomId: string) => number | undefined;
};

type InitialValues = {username: string; userId?: string};
export const createUser = (init: InitialValues): User => {
  const {username, userId = uuid()} = init;
  const _scores: {[roomId: string]: number} = {};

  const addToScore = (roomId: string, val: number) => (_scores[roomId] += val);
  const retrieveScore = (roomId: string) => _scores[roomId];

  return {
    username,
    userId,
    addToScore,
    retrieveScore,
  };
};
