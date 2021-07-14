import {createGame, Game as EGame} from 'domain/entities';
import {Game as DBGame} from 'infrastructure/db';
import {Mapper} from './types';
import {wordMapper} from './wordMapper';

export const gameMapper: Mapper<EGame, DBGame> = {
  toPersistence: (game) => {
    return {
      gameId: game.getGameId(),
      words: game.getWords().map((word) => wordMapper.toPersistence(word)),
    };
  },

  toDomain: (raw) => {
    return createGame({
      gameId: raw.gameId,
      words: raw.words.map((word) => wordMapper.toDomain(word)),
    });
  },
};
