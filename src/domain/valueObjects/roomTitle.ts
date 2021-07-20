import {ValidationError} from 'domain/ValidationError';
import {ValueObject} from './types';

export const createRoomTitle = (roomTitle: string): ValueObject<string> => {
  if (!roomTitle) throw new ValidationError('RoomTitle is required.');

  if (roomTitle.length < 3) {
    throw new ValidationError('RoomTitle must be at least 3 characters long.');
  }

  if (roomTitle.length > 30) {
    throw new ValidationError('RoomTitle must be at max 30 characters long.');
  }

  const value = () => roomTitle;

  return {value};
};
