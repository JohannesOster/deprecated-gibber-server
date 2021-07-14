import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type WordStatus =
  | 'open'
  | 'selected'
  | 'claimed'
  | 'accepted'
  | 'denied'
  | 'banned';

export type Word = {
  wordId: string;
  word: string; // the actual word
  _accepted: string[];
  _denied: string[];
  _upvotes: string[];
  _downvotes: string[];

  retrieveStatus: () => WordStatus;
  retrieveSelectedBy: () => string | undefined;
  createdAt: number;
  updatedAt: number;

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
  wordId?: string;
  status?: WordStatus;
  selectedBy?: string;
  updatedAt?: number;
  createdAt?: number;

  _accepted?: string[];
  _denied?: string[];
  _upvotes?: string[];
  _downvotes?: string[];
};

export const createWord = (init: InitialValues): Word => {
  const {
    wordId = uuid(),
    word,
    updatedAt = Date.now(),
    createdAt = Date.now(),

    _accepted = [],
    _denied = [],
    _upvotes = [],
    _downvotes = [],
  } = init;
  let {selectedBy, status = 'open'} = init;
  const DEFAULT_POINTS = 1;

  const accept = (userId: string) => {
    if (status !== 'claimed') {
      throw new InvalidOperationError(
        'Word has to be claimed before accepting it.',
      );
    }

    if (selectedBy === userId) {
      throw new InvalidOperationError('Cannot accept own claim.');
    }

    _accepted.push(userId);
  };

  const deny = (userId: string) => {
    if (status !== 'claimed') {
      throw new InvalidOperationError(
        'Word has to be claimed before denying it.',
      );
    }

    if (selectedBy === userId) {
      throw new InvalidOperationError('Cannot deny own claim.');
    }

    _denied.push(userId);
  };

  const upvote = (userId: string) => {
    if (_upvotes.includes(userId)) {
      throw new InvalidOperationError('Cannot upvote same word twice');
    }

    if (_downvotes.includes(userId)) {
      const idx = _downvotes.findIndex((id) => id === userId);
      _downvotes.splice(idx, 1);
    }

    _upvotes.push(userId);
  };
  const downvote = (userId: string) => {
    if (_downvotes.includes(userId)) {
      throw new InvalidOperationError('Cannot downvote same word twice');
    }

    if (_upvotes.includes(userId)) {
      const idx = _upvotes.findIndex((id) => id === userId);
      _upvotes.splice(idx, 1);
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
    wordId,
    word,
    retrieveStatus: () => status,
    retrieveSelectedBy: () => selectedBy,
    createdAt,
    updatedAt,

    select: function (userId: string) {
      if (selectedBy) {
        throw new InvalidOperationError('Word is already selected');
      }

      status = 'selected';
      selectedBy = userId;
    },
    deselect: function (userId: string) {
      if (selectedBy !== userId) {
        throw new InvalidOperationError('You did not select this word.');
      }
      status = 'open';
      selectedBy = undefined;
    },

    claim: function (userId: string) {
      if (selectedBy !== userId) {
        throw new InvalidOperationError('You did not select this word.');
      }
      status = 'claimed';
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

    _accepted,
    _denied,
    _downvotes,
    _upvotes,
  };
};
