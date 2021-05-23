import {v4 as uuid} from 'uuid';

export type User = {
  userId: string;
  username: string;
  score: number;
  increaseScore: (val?: number) => void;
  decreaseScore: (val?: number) => void;
};

export const createUser = (username: string, userId: string = uuid()): User => {
  return {
    username,
    userId,
    score: 0,
    increaseScore: function (val: number = 1) {
      this.score += val;
    },
    decreaseScore: function (val: number = 2) {
      this.score -= val;
    },
  };
};
