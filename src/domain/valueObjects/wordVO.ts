import {ValidationError} from 'domain/ValidationError';
import {ValueObject} from './types';

// For the lack of a better alternative the human readable word is called wordVO whereas the word entity is called word
export const createWordVO = (word: string): ValueObject<string> => {
  if (!word) throw new ValidationError('Word is required.');

  if (word.length < 3) {
    throw new ValidationError('Word must be at least 3 characters long.');
  }

  if (word.length > 30) {
    throw new ValidationError('Word must be at max 30 characters long.');
  }

  const value = () => word;

  return {value};
};
