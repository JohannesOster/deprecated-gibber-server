import {sortBy} from 'utilities';
import {v4 as uuid} from 'uuid';
import {Word} from './word';

export type Game = {
  gameId: string;

  addWord: (word: Word) => void;
  retrieveWord: (wordId: string) => Word | undefined;
  listWords: () => Word[];
  deleteWord: (wordId: string) => void;
};

type InitialValues = {
  gameId?: string;
  words?: Word[];
};

export const createGame = (init: InitialValues = {}): Game => {
  const {gameId = uuid(), words: _words = []} = init;

  const maxWords = 100;

  const listWords = () => _words;

  const retrieveWord = (wordId: string) => {
    return _words.find((_word) => _word.getWordId() === wordId);
  };

  const addWord = (word: Word) => {
    _words.unshift(word);
    if (_words.length >= maxWords) _words.pop();
  };

  const deleteWord = (wordId: string) => {
    const idx = _words.findIndex((word) => word.getWordId() === wordId);
    _words.splice(idx, 1);
  };

  return {
    gameId,

    addWord,
    retrieveWord,
    listWords,
    deleteWord,
  };
};
