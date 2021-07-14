import {createRoom, Room as ERoom} from 'domain/entities';
import {Room as DBRoom} from 'infrastructure/db';
import {chatMessageMapper} from './chatMessageMapper';
import {gameMapper} from './gameMapper';
import {Mapper} from './types';
import {userMapper} from './userMapper';

export const roomMapper: Mapper<ERoom, DBRoom> = {
  toPersistence: (room) => {
    const currentGame = room.getCurrentGame();

    return {
      roomId: room.getRoomId(),
      roomTitle: room.getRoomTitle(),
      currentGame: currentGame
        ? gameMapper.toPersistence(currentGame)
        : undefined,
      players: room
        .getPlayers()
        .map(({status, totalScore, currentScore, user}) => ({
          status,
          totalScore,
          currentScore,
          user: userMapper.toPersistence(user),
        })),
      chatMessages: room
        .listChatMessages()
        .map((message) => chatMessageMapper.toPersistence(message)),
    };
  },

  toDomain: (raw) => {
    return createRoom({
      roomId: raw.roomId,
      roomTitle: raw.roomTitle,
      currentGame: raw.currentGame
        ? gameMapper.toDomain(raw.currentGame)
        : undefined,
      players: raw.players.map(({status, totalScore, currentScore, user}) => ({
        status,
        totalScore,
        currentScore,
        user: userMapper.toDomain(user),
      })),
      chatMessages: raw.chatMessages.map((message) =>
        chatMessageMapper.toDomain(message),
      ),
    });
  },
};
