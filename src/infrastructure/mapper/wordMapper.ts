import {createWord, Word as EWord} from 'domain/entities';
import {Word as DBWord} from 'infrastructure/db';
import {Mapper} from './types';

export const wordMapper: Mapper<EWord, DBWord> = {
  toPersistence: (word) => {
    return {
      wordId: word.wordId,
      word: word.word,
      createdAt: word.createdAt,
      updatedAt: word.updatedAt,
      selectedBy: word.retrieveSelectedBy(),
      status: word.retrieveStatus(),

      _accepted: word._accepted,
      _denied: word._denied,
      _downvotes: word._downvotes,
      _upvotes: word._upvotes,
    };
  },

  toDomain: (raw) => {
    return createWord({
      wordId: raw.wordId,
      word: raw.word,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt,
      selectedBy: raw.selectedBy,
      status: raw.status,

      _accepted: raw._accepted,
      _denied: raw._denied,
      _downvotes: raw._downvotes,
      _upvotes: raw._upvotes,
    });
  },
};
