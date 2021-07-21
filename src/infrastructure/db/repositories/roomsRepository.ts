import {Repository} from './types';
import {Room as ERoom} from 'domain/entities/room';
import {Database, Game, Room as DBRoom, Room} from '../types';
import {roomMapper} from 'infrastructure/mapper/roomMapper';
import {DefaultDeserializer} from 'node:v8';

type TRoomsRepository = Repository<ERoom> & {
  findById: (userId: string) => Promise<ERoom | undefined>;
  list: () => Promise<ERoom[]>;
  del: (roomId: string) => Promise<undefined>;
};

export const RoomsRepository = (db: Database): TRoomsRepository => {
  const DB_KEY = 'rooms';

  const all = (): Promise<DBRoom['room'][]> => {
    return db.get(DB_KEY).then((rooms) => {
      if (!rooms) return [];
      return Array.isArray(rooms) ? rooms : [rooms];
    });
  };

  const findById = async (roomId: string) => {
    const rooms = await all();
    const room = rooms.find((room) => room.roomId === roomId);
    if (!room) return Promise.resolve(undefined);

    if (!room.currentGameId) {
      return Promise.resolve(roomMapper.toDomain({room}));
    }

    return db.get(room.currentGameId).then((currentGame: any) => {
      try {
        if (!currentGame) throw new Error('Cannot find current game');
        return roomMapper.toDomain({room, currentGame});
      } catch (error) {
        console.error(error); // TODO: Reason behind error unknown
        return Promise.resolve(roomMapper.toDomain({room}));
      }
    });
  };

  const list = async () => {
    const rooms = await all();

    return Promise.all(
      rooms.map(async (room) => {
        if (!room.currentGameId) return roomMapper.toDomain({room});
        return await db
          .get(room.currentGameId)
          .then((currentGame: any) => roomMapper.toDomain({room, currentGame}));
      }),
    );
  };

  const save = async (room: ERoom) => {
    const rooms = await all();
    let _roomIdx = rooms.findIndex(
      (_room) => _room.roomId === room.getRoomId(),
    );

    const {room: _room, currentGame} = roomMapper.toPersistence(room);

    if (_roomIdx < 0) {
      rooms.push(_room);

      const promises: Promise<any>[] = [];
      promises.push(db.set(DB_KEY, rooms));
      if (currentGame) promises.push(db.set(currentGame.gameId, currentGame));

      return Promise.all(promises).then(() => room);
    }

    // - if game existed but now has ended, remove it
    if (!currentGame) {
      if (rooms[_roomIdx].currentGameId) {
        await db.del(rooms[_roomIdx].currentGameId!);
      }
    }
    // - replace old room
    rooms[_roomIdx] = _room;
    const promises: Promise<any>[] = [];
    promises.push(db.set(DB_KEY, rooms));
    if (currentGame) promises.push(db.set(currentGame.gameId, currentGame));

    return db.set(DB_KEY, rooms).then(() => room);
  };

  const del = async (roomId: string) => {
    const rooms = (await all()).filter((room) => room.roomId !== roomId);
    return db.set(DB_KEY, rooms).then(() => undefined);
  };

  return {save, list, findById, del};
};
