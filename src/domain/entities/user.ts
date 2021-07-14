import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type User = {
  userId: string;
  username: string;
  createdAt: number;
  updatedAt: number;
  addToScore: (roomId: string, val: number) => void;
  retrieveScore: (roomId: string) => number | undefined;
};

type InitialValues = {
  username: string;
  userId?: string;
  createdAt?: number;
  updatedAt?: number;
};
export const createUser = (init: InitialValues): User => {
  const {
    username,
    userId = uuid(),
    createdAt = Date.now(),
    updatedAt = Date.now(),
  } = init;

  // - Validation
  if (username.length < 3) {
    throw new ValidationError('Username must be at least 3 characters long.');
  }

  if (username.length > 30) {
    throw new ValidationError('Username must be at max 30 characters long.');
  }

  const _scores: {[roomId: string]: number} = {};

  const addToScore = (roomId: string, val: number) => {
    _scores[roomId] = (_scores[roomId] || 0) + val;
  };

  const retrieveScore = (roomId: string) => _scores[roomId];

  return {
    username,
    userId,
    createdAt,
    updatedAt,
    addToScore,
    retrieveScore,
  };
};
