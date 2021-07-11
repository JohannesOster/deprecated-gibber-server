import {ValidationError} from 'domain/ValidationError';
import {sortBy} from 'utilities';
import {v4 as uuid} from 'uuid';
import {User} from './user';
import {createWord, Word} from './word';

type ScoreBoard = {[userId: string]: number};
type Score = {
  score: number;
  highScore: number;
};

export type Game = {
  gameId: string;
  createdAt: number;

  addWord: (word: Word) => void;
  retrieveWord: (wordId: string) => Word | undefined;
  listWords: () => Word[];
  deleteWord: (wordId: string) => void;

  join: (user: User) => void;

  updateScore: (userId: string, operand: number) => void;
  retrieveScore: (userId: string) => Score | undefined;
  retrieveScoreBoard: () => ScoreBoard;
};

type InitialValues = {
  gameId?: string;
  words?: Word[];
  maxWords?: number;
  users: User[];
};

export const createGame = (init: InitialValues): Game => {
  const {
    gameId = uuid(),
    words: _words = [],
    maxWords = 100,
    users: _users,
  } = init;
  const createdAt = Date.now();

  if (_users.length < 2) {
    throw new ValidationError('Game requires at least two players.');
  }

  const scoreBoard = _users.reduce((acc, curr) => {
    acc[curr.userId] = 0;
    return acc;
  }, {} as ScoreBoard);

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

  const updateScore = (userId: string, operand: number) => {
    if (!scoreBoard[userId]) scoreBoard[userId] = operand;
    else scoreBoard[userId] += operand;
  };

  const retrieveScore = (userId: string) => {
    const score = scoreBoard[userId];
    if (score === undefined) return;

    const highScore = Object.values(scoreBoard).reduce((highScore, score) => {
      return score <= highScore ? highScore : score;
    });

    return {score, highScore};
  };

  const retrieveScoreBoard = () => {
    const _scoreBoard = {...scoreBoard};
    Object.freeze(_scoreBoard);
    return _scoreBoard;
  };

  const join = (user: User) => {
    _users.push(user);
  };

  return {
    gameId,
    createdAt,

    addWord,
    retrieveWord,
    listWords,
    deleteWord,

    join,

    updateScore,
    retrieveScore,
    retrieveScoreBoard,
  };
};
