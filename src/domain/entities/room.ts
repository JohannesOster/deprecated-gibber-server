import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';
import {sortBy} from 'utilities';
import {v4 as uuid} from 'uuid';
import {User} from './user';
import {Word} from './word';

export type Room = {
  roomId: string;
  roomTitle: string;
  createdAt: number;
  /** Maximal number of users joining this room */
  maxMembers: number;
  /** The maximal number of words selectable in this room */
  maxWords: number;

  join: (user: User) => void;
  leave: (userId: string) => void;

  listUsers: () => User[];
  listWords: () => Word[];

  retrieveUser: (userId: string) => User | undefined;
  retrieveWord: (wordId: string) => Word | undefined;

  addWord: (word: Word) => void;
};

type InitialValues = {
  roomId?: string;
  roomTitle: string;
  words?: Word[];
  maxMembers?: number;
  maxWords?: number;
};

export const createRoom = (init: InitialValues): Room => {
  const {
    roomId = uuid(),
    roomTitle,
    words: _words = [],
    maxMembers = 100,
    maxWords = 100,
  } = init;
  const _users: User[] = [];
  const createdAt = Date.now();

  // - Validation
  if (roomTitle.length < 3) {
    throw new ValidationError('RoomTitle must be at least 3 characters long.');
  }

  if (roomTitle.length > 30) {
    throw new ValidationError('RoomTitle must be at max 30 characters long.');
  }

  const join = (user: User) => {
    if (_users.length >= maxMembers) {
      throw new InvalidOperationError(
        `Maximal amount of members (=${maxMembers}) reached. Cannot join.`,
      );
    }
    _users.push(user);
  };
  const leave = (userId: string) => {
    const idx = _users.findIndex((_user) => _user.userId === userId);
    if (idx === -1) throw Error('Can not leave room you never joined.');

    _users.splice(idx, 1);

    // reset all that are selected by leaving user
    _words.forEach((word) => {
      if (word.selectedBy !== userId) return;
      word.deselect(userId);
    });
  };

  const listUsers = () => {
    return sortBy(_users, [
      {path: 'score', asc: false},
      {path: 'username', asc: true},
    ]);
  };

  const listWords = () => {
    return sortBy(_words, [{path: 'createdAt', asc: true}]);
  };

  const retrieveUser = (userId: string) => {
    return _users.find((_user) => _user.userId === userId);
  };

  const retrieveWord = (wordId: string) => {
    return _words.find((_word) => _word.wordId === wordId);
  };

  const addWord = (word: Word) => {
    _words.unshift(word);
    if (_words.length >= maxWords) _words.pop();
  };

  return {
    roomId,
    roomTitle,
    createdAt,
    maxMembers,
    maxWords,

    join,
    leave,

    listUsers,
    listWords,

    retrieveUser,
    retrieveWord,
    addWord,
  };
};
