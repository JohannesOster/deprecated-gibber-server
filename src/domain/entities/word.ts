import {v4 as uuid} from 'uuid';

type WordStatus = 'open' | 'selected' | 'claimed';

export type Word = {
  wordId: string;
  /** The actual word */
  word: string;
  status: WordStatus;
  selectedBy?: string;
  /* The voting score for the current word. Weather or not it will get accepted */
  score: number;
  /** The number of points the word will bring */
  points: number;
  createdAt: Date;
  select: (userId: string) => void;
  deselect: () => void;
  claim: () => void;
  accept: () => void;
  deny: () => void;
  reset: () => void;
  upvote: () => void;
  downvote: () => void;
};

export const createWord = (word: string): Word => {
  const wordId = uuid();

  return {
    wordId,
    word,
    status: 'open',
    score: 1,
    points: 10,
    createdAt: new Date(),
    select: function (userId: string) {
      this.status = 'selected';
      this.selectedBy = userId;
    },
    deselect: function () {
      this.status = 'open';
      delete this.selectedBy;
    },
    claim: function () {
      this.status = 'claimed';
    },
    accept: function () {
      this.score += 1;
    },
    deny: function () {
      this.score -= 1;
    },
    reset: function () {
      this.status = 'open';
      delete this.selectedBy;
    },
    upvote: function () {
      this.points += 10;
    },
    downvote: function () {
      this.points -= 10;
    },
  };
};
