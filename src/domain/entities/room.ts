import {v4 as uuid} from 'uuid';
import {User} from './user';
import {Word} from './word';

export type Room = {
  roomId: string;
  roomTitle: string;
  join: (user: User) => void;
  leave: (userId: string) => void;
  select: (userId: string, wordId: string) => void;
  deselect: (userId: string, wordId: string) => void;
  claim: (userId: string, wordId: string) => void;
  accept: (userId: string, wordId: string) => void;
  deny: (userId: string, wordId: string) => void;
  reset: (wordId: string) => void;
  listUsers: () => User[];
  listWords: () => Word[];
  retrieveUser: (userId: string) => User | undefined;
  retrieveWord: (wordId: string) => Word | undefined;
  addWord: (word: Word) => void;
};

export const createRoom = (
  init: {roomTitle?: string; roomId?: string; words?: Word[]} = {},
): Room => {
  const MAX_WORDS = 5;

  const {roomId = uuid(), roomTitle = '', words: _words = []} = init;

  const _users: User[] = [];

  const listUsers = () => {
    return _users.sort((a, b) => {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      return a.username > b.username ? 1 : -1;
    });
  };

  const join = (user: User) => {
    _users.push(user);
  };

  const leave = (userId: string) => {
    const idx = _users.findIndex((_user) => _user.userId === userId);
    if (idx === -1) return;

    _users.splice(idx, 1);

    // reset all words
    _words.forEach((word) => {
      if (word.selectedBy !== userId) return;
      word.deselect();
      word.score = 0;
    });
  };

  const select = (userId: string, wordId: string) => {
    _words.forEach((_word) => {
      if (_word.selectedBy !== userId && _word.wordId !== wordId) return;
      _word.wordId === wordId ? _word.select(userId) : _word.deselect();
    });
  };

  const deselect = (userId: string, wordId: string) => {
    for (let i = 0; i < _words.length; i++) {
      if (_words[i].wordId !== wordId) continue;
      _words[i].deselect();
      break;
    }
  };

  const claim = (userId: string, wordId: string) => {
    for (let i = 0; i < _words.length; i++) {
      if (_words[i].wordId !== wordId) continue;
      if (_words[i].selectedBy !== userId) break;
      _words[i].claim();
      break;
    }
  };

  const accept = (userId: string, wordId: string) => {
    for (let i = 0; i < _words.length; i++) {
      if (_words[i].wordId !== wordId) continue;
      _words[i].accept();
      break;
    }
  };

  const deny = (userId: string, wordId: string) => {
    for (let i = 0; i < _words.length; i++) {
      if (_words[i].wordId !== wordId) continue;
      _words[i].deny();
      break;
    }
  };

  const sortWords = () => {
    _words.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  return {
    roomId,
    roomTitle,
    listUsers,
    join,
    leave,
    select,
    deselect,
    claim,
    accept,
    deny,
    reset: (wordId: string) => {
      for (let i = 0; i < _words.length; i++) {
        if (_words[i].wordId !== wordId) continue;
        _words[i].reset();
        break;
      }
    },
    retrieveUser: function (userId: string) {
      return _users.find((_user) => _user.userId === userId);
    },
    retrieveWord: function (wordId: string) {
      return _words.find((_word) => _word.wordId === wordId);
    },
    listWords: () => {
      sortWords();
      return _words;
    },
    addWord: (word) => {
      _words.push(word);
      sortWords();
      if (_words.length >= MAX_WORDS) {
        _words.pop();
      }
    },
  };
};
