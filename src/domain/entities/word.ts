import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

type WordStatus =
  | 'open'
  | 'selected'
  | 'claimed'
  | 'accepted'
  | 'denied'
  | 'banned';

export type Word = {
  wordId: string;
  word: string; // the actual word
  status: WordStatus;
  selectedBy?: string;
  createdAt: number;

  select: (userId: string) => void;
  deselect: (userId: string) => void;

  claim: (userId: string) => void;

  accept: (userId: string) => void;
  deny: (userId: string) => void;

  upvote: (userId: string) => void;
  downvote: (userId: string) => void;

  retrievePoints: () => number;
  retrievePollResult: () => number;
};

type InitialValues = {
  word: string;
};

export const createWord = (init: InitialValues): Word => {
  const {word} = init;
  const DEFAULT_POINTS = 10;

  const _accepted: string[] = [];
  const _denied: string[] = [];

  const _upvotes: string[] = [];
  const _downvotes: string[] = [];

  const accept = (userId: string) => _accepted.push(userId);
  const deny = (userId: string) => _denied.push(userId);
  const upvote = (userId: string) => {
    if (_upvotes.includes(userId)) {
      throw new InvalidOperationError('Cannot upvote same word twice');
    }
    _upvotes.push(userId);
  };
  const downvote = (userId: string) => {
    if (_downvotes.includes(userId)) {
      throw new InvalidOperationError('Cannot downvote same word twice');
    }

    _downvotes.push(userId);
  };

  // - Validation
  if (word.length < 3) {
    throw new ValidationError('Word must be at least 3 characters long.');
  }

  if (word.length > 30) {
    throw new ValidationError('Word must be at max 30 characters long.');
  }

  return {
    wordId: uuid(),
    word,
    status: 'open',
    createdAt: Date.now(),

    select: function (userId: string) {
      if (this.selectedBy) {
        throw new InvalidOperationError('Word is already selected');
      }
      this.status = 'selected';
      this.selectedBy = userId;
    },
    deselect: function (userId: string) {
      if (this.selectedBy !== userId) {
        throw new InvalidOperationError('You did not select this word.');
      }
      this.status = 'open';
      delete this.selectedBy;
    },

    claim: function (userId: string) {
      if (this.selectedBy !== userId) {
        throw new InvalidOperationError('You did not select this word.');
      }
      this.status = 'claimed';
    },

    accept,
    deny,

    upvote,
    downvote,

    retrievePoints: function () {
      return DEFAULT_POINTS + _upvotes.length - _downvotes.length;
    },
    retrievePollResult: function () {
      return _accepted.length - _denied.length;
    },
  };
};
