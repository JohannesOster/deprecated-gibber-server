import {v4 as uuid} from 'uuid';

type WordStatus = 'open' | 'selected' | 'claimed';

export type Word = {
  wordId: string;
  /** The actual word */
  word: string;
  status: WordStatus;
  selectedBy?: string;
  score: number;
  createdAt: Date;
  select: (userId: string) => void;
  deselect: () => void;
  claim: () => void;
  accept: () => void;
  deny: () => void;
  reset: () => void;
};

export const createWord = (word: string): Word => {
  const wordId = uuid();

  return {
    wordId,
    word,
    status: 'open',
    score: 1,
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
  };
};
