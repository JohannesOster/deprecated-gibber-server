import {createWord, Word as EWord} from 'domain/entities';
import {Word as DBWord} from 'infrastructure/db';
import {Mapper} from './types';

export const wordMapper: Mapper<EWord, DBWord> = {
  toPersistence: (word) => {
    return {
      wordId: word.getWordId(),
      word: word.getWord(),
      selectedBy: word.getSelectedBy(),
      status: word.getStatus(),

      acceptedBy: word.getAcceptedBy(),
      deniedBy: word.getAcceptedBy(),
      upvotedBy: word.getUpvotedBy(),
      downvotedBy: word.getDownvotedBy(),
    };
  },

  toDomain: (raw) => {
    return createWord({
      wordId: raw.wordId,
      word: raw.word,
      selectedBy: raw.selectedBy,
      status: raw.status,

      acceptedBy: raw.acceptedBy,
      deniedBy: raw.deniedBy,
      upvotedBy: raw.upvotedBy,
      downvotedBy: raw.downvotedBy,
    });
  },
};
