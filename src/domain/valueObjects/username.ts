import {ValidationError} from 'domain/ValidationError';
import {ValueObject} from './types';

export const createUsername = (username: string): ValueObject<string> => {
  if (!username) throw new ValidationError('Username is required.');

  if (username.length < 3) {
    throw new ValidationError('Username must be at least 3 characters long.');
  }

  if (username.length > 30) {
    throw new ValidationError('Username must be at max 30 characters long.');
  }

  const value = () => username;

  return {value};
};
