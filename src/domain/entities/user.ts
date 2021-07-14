import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type User = {
  userId: string;
  username: string;
  score: number;
};

type InitialValues = {
  username: string;
  userId?: string;
  score?: number;
};
export const createUser = (init: InitialValues): User => {
  const {username, userId = uuid(), score = 0} = init;

  // - Validation
  if (username.length < 3) {
    throw new ValidationError('Username must be at least 3 characters long.');
  }

  if (username.length > 30) {
    throw new ValidationError('Username must be at max 30 characters long.');
  }

  return {
    username,
    userId,
    score,
  };
};
