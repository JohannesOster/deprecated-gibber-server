import {InvalidOperationError} from 'domain/InvalidOperationError';
import {createWordVO} from 'domain/valueObjects/wordVO';
import {v4 as uuid} from 'uuid';

export type WordStatus = 'open' | 'selected' | 'claimed';

export type Word = {
  getWordId: () => string;
  getWord: () => string; // the human readable word

  getAcceptedBy: () => string[];
  getDeniedBy: () => string[];

  getUpvotedBy: () => string[];
  getDownvotedBy: () => string[];

  getStatus: () => WordStatus;
  getSelectedBy: () => string | undefined;

  getPoints: () => number;
  getPollResult: () => number;

  select: (userId: string) => void;
  deselect: (userId: string) => void;

  claim: (userId: string) => void;

  accept: (userId: string) => void;
  deny: (userId: string) => void;

  upvote: (userId: string) => void;
  downvote: (userId: string) => void;
};

type InitialValues = {
  word: string;
  wordId?: string;
  status?: WordStatus;
  selectedBy?: string;

  acceptedBy?: string[];
  deniedBy?: string[];
  upvotedBy?: string[];
  downvotedBy?: string[];
};

export const createWord = (init: InitialValues): Word => {
  // By default the user gets one point if his claim gets accepted
  const DEFAULT_POINTS = 1;

  const {
    wordId = uuid(),

    acceptedBy = [],
    deniedBy = [],
    upvotedBy = [],
    downvotedBy = [],
  } = init;
  let {selectedBy, status = 'open'} = init;
  const word = createWordVO(init.word);

  const getWordId = () => wordId;
  const getWord = () => word.value();
  const getUpvotedBy = () => upvotedBy;
  const getDownvotedBy = () => downvotedBy;
  const getAcceptedBy = () => acceptedBy;
  const getDeniedBy = () => deniedBy;
  const getStatus = () => status;
  const getSelectedBy = () => selectedBy;

  const accept = (userId: string) => {
    if (status !== 'claimed') {
      const msg = 'Word has to be claimed before accepting it.';
      throw new InvalidOperationError(msg);
    }

    if (selectedBy === userId) {
      throw new InvalidOperationError('Cannot accept own claim.');
    }

    acceptedBy.push(userId);
  };

  const deny = (userId: string) => {
    if (status !== 'claimed') {
      const msg = 'Word has to be claimed before denying it.';
      throw new InvalidOperationError(msg);
    }

    if (selectedBy === userId) {
      throw new InvalidOperationError('Cannot deny own claim.');
    }

    deniedBy.push(userId);
  };

  const upvote = (userId: string) => {
    if (upvotedBy.includes(userId)) {
      throw new InvalidOperationError('Cannot upvote same word twice.');
    }

    if (downvotedBy.includes(userId)) {
      const idx = downvotedBy.findIndex((id) => id === userId);
      downvotedBy.splice(idx, 1);
    }

    upvotedBy.push(userId);
  };

  const downvote = (userId: string) => {
    if (downvotedBy.includes(userId)) {
      throw new InvalidOperationError('Cannot downvote same word twice.');
    }

    if (upvotedBy.includes(userId)) {
      const idx = upvotedBy.findIndex((id) => id === userId);
      upvotedBy.splice(idx, 1);
    }

    downvotedBy.push(userId);
  };

  const select = (userId: string) => {
    if (selectedBy) {
      throw new InvalidOperationError('Word is already selected.');
    }

    status = 'selected';
    selectedBy = userId;
  };
  const deselect = (userId: string) => {
    if (selectedBy !== userId) {
      throw new InvalidOperationError('You did not select this word.');
    }
    status = 'open';
    selectedBy = undefined;
  };

  const claim = (userId: string) => {
    if (selectedBy !== userId) {
      throw new InvalidOperationError('You did not select this word.');
    }
    status = 'claimed';
  };

  const getPoints = () => {
    return DEFAULT_POINTS + upvotedBy.length - downvotedBy.length;
  };

  const getPollResult = () => acceptedBy.length - deniedBy.length;

  return {
    getWordId,
    getWord,

    getAcceptedBy,
    getDeniedBy,

    getUpvotedBy,
    getDownvotedBy,

    getStatus,
    getSelectedBy,

    getPoints,
    getPollResult,

    select,
    deselect,

    claim,

    accept,
    deny,

    upvote,
    downvote,
  };
};
