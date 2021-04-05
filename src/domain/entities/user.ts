import {v4 as uuid} from 'uuid';

export type User = {
  userId: string;
  username: string;
  score: number;
  increaseScore: () => void;
  decreaseScore: () => void;
};

export const createUser = (username: string, userId: string = uuid()): User => {
  return {
    username,
    userId,
    score: 0,
    increaseScore: function () {
      this.score += 1;
    },
    decreaseScore: function () {
      this.score -= 1;
    },
  };
};
