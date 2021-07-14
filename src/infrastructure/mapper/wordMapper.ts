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
    };
  },

  toDomain: (raw) => {
    return createWord({
      wordId: raw.wordId,
      word: raw.word,
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt,
    });
  },
};
