import {createGame, Game as EGame} from 'domain/entities';
import {Game as DBGame} from 'infrastructure/db';
import {Mapper} from './types';
import {wordMapper} from './wordMapper';

export const gameMapper: Mapper<EGame, DBGame> = {
  toPersistence: (game) => {
    return {
      gameId: game.gameId,
      words: game.listWords().map((word) => wordMapper.toPersistence(word)),
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  },

  toDomain: (raw) => {
    return createGame({
      gameId: raw.gameId,
      words: raw.words.map((word) => wordMapper.toDomain(word)),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },
};
