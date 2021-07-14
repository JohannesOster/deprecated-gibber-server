import {createRoom, Room as ERoom} from 'domain/entities';
import {Room as DBRoom} from 'infrastructure/db';
import {chatMessageMapper} from './chatMessageMapper';
import {gameMapper} from './gameMapper';
import {Mapper} from './types';
import {userMapper} from './userMapper';

export const roomMapper: Mapper<ERoom, DBRoom> = {
  toPersistence: (room) => {
    const currentGame = room.retrieveCurrentGame();

    return {
      roomId: room.roomId,
      roomTitle: room.roomTitle,
      currentGame: currentGame
        ? gameMapper.toPersistence(currentGame)
        : undefined,
      users: room
        .listUsers()
        .map(({status, totalScore, currentScore, user}) => ({
          status,
          totalScore,
          currentScore,
          user: userMapper.toPersistence(user),
        })),
      chatMessages: room
        .listChatMessages()
        .map((message) => chatMessageMapper.toPersistence(message)),

      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  },

  toDomain: (raw) => {
    return createRoom({
      roomId: raw.roomId,
      roomTitle: raw.roomTitle,
      currentGame: raw.currentGame
        ? gameMapper.toDomain(raw.currentGame)
        : undefined,
      users: raw.users.map(({status, totalScore, currentScore, user}) => ({
        status,
        totalScore,
        currentScore,
        user: userMapper.toDomain(user),
      })),
      chatMessages: raw.chatMessages.map((message) =>
        chatMessageMapper.toDomain(message),
      ),

      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },
};
