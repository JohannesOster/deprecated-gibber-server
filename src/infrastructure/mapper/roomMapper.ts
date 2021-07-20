import {createRoom, Room as ERoom} from 'domain/entities';
import {Room as DBRoom} from 'infrastructure/db';
import {Room as DTORoom} from 'infrastructure/dto';
import {chatMessageMapper} from './chatMessageMapper';
import {gameMapper} from './gameMapper';
import {Mapper} from './types';
import {userMapper} from './userMapper';

export const roomMapper: Mapper<ERoom, DBRoom, DTORoom> = {
  toPersistence: (room) => {
    const currentGame = room.getCurrentGame();
    const currentGameMapped = currentGame
      ? gameMapper.toPersistence(currentGame)
      : undefined;

    return {
      room: {
        roomId: room.getRoomId(),
        roomTitle: room.getRoomTitle(),
        currentGameId: currentGame?.getGameId(),
        terminationDate: room.getTerminationDate().toString(),
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
      },
      currentGame: currentGameMapped,
    };
  },

  toDomain: ({room, currentGame}) => {
    return createRoom({
      roomId: room.roomId,
      roomTitle: room.roomTitle,
      terminationDate: new Date(room.terminationDate),
      currentGame: currentGame ? gameMapper.toDomain(currentGame) : undefined,
      players: room.players.map(({status, totalScore, currentScore, user}) => ({
        status,
        totalScore,
        currentScore,
        user: userMapper.toDomain(user),
      })),
      chatMessages: room.chatMessages.map((message) =>
        chatMessageMapper.toDomain(message),
      ),
    });
  },

  toDTO: (room) => ({
    roomId: room.getRoomId(),
    roomTitle: room.getRoomTitle(),
  }),
};
