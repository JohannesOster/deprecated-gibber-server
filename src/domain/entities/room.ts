import {v4 as uuid} from 'uuid';
import {User} from './user';
import {Word} from './word';

export type Room = {
  roomId: string;
  _words: Word[];
  _users: User[];
  join: (user: User) => void;
  leave: (user: User) => void;
  getUsers: () => User[];
  claim: (user: User, word: string) => void;
  unclaim: (user: User, word: string) => void;
  open: (word: string) => void;
  challange: (user: User, word: string) => void;
  accept: (user: User, word: string) => void;
  deny: (user: User, word: string) => void;
  getUser: (userId: string) => User | undefined;
  getWord: (word: string) => Word | undefined;
};

export const createRoom = (_words: Word[], roomId: string = uuid()): Room => {
  return {
    roomId,
    _words,
    _users: [],
    getUsers: function () {
      return this._users.sort((a, b) => {
        if (a.score > b.score) return 1;
        if (a.score < b.score) return -1;
        return a.username > b.username ? 1 : -1;
      });
    },
    join: function (user) {
      this._users.push(user);
    },
    leave: function (user) {
      const idx = this._users.findIndex(
        (_user) => _user.userId === user.userId,
      );
      if (idx === -1) return;
      this._users.splice(idx, 1);
      this._words.forEach((word) => {
        if (word.claimedBy !== user.userId) return;
        word.unclaim();
        word.score = 0;
      });
    },
    claim: function (user: User, word: string) {
      this._words.forEach((_word) => {
        if (_word.claimedBy !== user.userId && _word.word !== word) return;
        _word.word === word ? _word.claim(user.userId) : _word.unclaim();
      });
    },
    unclaim: function (user: User, word: string) {
      for (let i = 0; i < this._words.length; i++) {
        if (_words[i].word !== word) continue;
        _words[i].unclaim();
        break;
      }
    },
    open: function (word: string) {
      for (let i = 0; i < this._words.length; i++) {
        if (_words[i].word !== word) continue;
        _words[i].unclaim();
        break;
      }
    },
    challange: function (user: User, word: string) {
      for (let i = 0; i < this._words.length; i++) {
        if (_words[i].word !== word) continue;
        if (_words[i].claimedBy !== user.userId) break;
        _words[i].challange();
        break;
      }
    },
    accept: function (user: User, word: string) {
      for (let i = 0; i < this._words.length; i++) {
        if (_words[i].word !== word) continue;
        _words[i].accept();
        break;
      }
    },
    deny: function (user: User, word: string) {
      for (let i = 0; i < this._words.length; i++) {
        if (_words[i].word !== word) continue;
        _words[i].deny();
        break;
      }
    },
    getUser: function (userId: string) {
      return this._users.find((_user) => _user.userId === userId);
    },
    getWord: function (word: string) {
      return this._words.find((_word) => _word.word === word);
    },
  };
};
