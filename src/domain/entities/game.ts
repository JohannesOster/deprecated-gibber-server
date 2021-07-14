import {sortBy} from 'utilities';
import {v4 as uuid} from 'uuid';
import {Word} from './word';

export type Game = {
  gameId: string;
  createdAt: number;
  updatedAt: number;

  addWord: (word: Word) => void;
  retrieveWord: (wordId: string) => Word | undefined;
  listWords: () => Word[];
  deleteWord: (wordId: string) => void;
};

type InitialValues = {
  gameId?: string;
  words?: Word[];

  updatedAt?: number;
  createdAt?: number;
};

export const createGame = (init: InitialValues = {}): Game => {
  const {
    gameId = uuid(),
    words: _words = [],

    updatedAt = Date.now(),
    createdAt = Date.now(),
  } = init;

  const maxWords = 100;

  const listWords = () => {
    return sortBy(_words, [{path: 'createdAt', asc: false}]);
  };

  const retrieveWord = (wordId: string) => {
    return _words.find((_word) => _word.wordId === wordId);
  };

  const addWord = (word: Word) => {
    _words.unshift(word);
    if (_words.length >= maxWords) _words.pop();
  };

  const deleteWord = (wordId: string) => {
    const idx = _words.findIndex((word) => word.wordId === wordId);
    _words.splice(idx, 1);
  };

  return {
    gameId,
    createdAt,
    updatedAt,

    addWord,
    retrieveWord,
    listWords,
    deleteWord,
  };
};
