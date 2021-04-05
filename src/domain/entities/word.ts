export type Word = {
  word: string;
  status: string;
  claimedBy?: string;
  score: number;
  claim: (userId: string) => void;
  unclaim: () => void;
  challange: () => void;
  accept: () => void;
  deny: () => void;
};

export const createWord = (word: string): Word => {
  return {
    word,
    status: 'open',
    score: 1,
    claim: function (userId: string) {
      this.status = 'claimed';
      this.claimedBy = userId;
    },
    unclaim: function () {
      this.status = 'open';
      delete this.claimedBy;
    },
    challange: function () {
      this.status = 'challanged';
    },
    accept: function () {
      this.score += 1;
    },
    deny: function () {
      this.score -= 1;
    },
  };
};
