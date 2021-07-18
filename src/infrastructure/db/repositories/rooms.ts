import {Repository} from './types';
import {Room as ERoom} from 'domain/entities/room';
import {Database, Game, Room as DBRoom, Room} from '../types';
import {roomMapper} from 'infrastructure/mapper/roomMapper';

type TRoomsRepository = Repository<ERoom> & {
  findById: (userId: string) => Promise<ERoom | undefined>;
  list: () => Promise<ERoom[]>;
};

export const RoomsRepository = (db: Database): TRoomsRepository => {
  const DB_KEY = 'rooms';

  const all = (): Promise<DBRoom[]> => {
    return db
      .get(DB_KEY)
      .then((rooms) => {
        if (!rooms) return [];
        return Array.isArray(rooms) ? rooms : [rooms];
      })
      .then(async (rooms) => {
        return await Promise.all(
          rooms.map(async (room) => {
            let currentGame = await (room.currentGameId
              ? db.get<Game>(room.currentGameId)
              : Promise.resolve(undefined));
            return {room, currentGame};
          }),
        );
      });
  };

  const findById = async (roomId: string) => {
    const rooms = await all();
    const room = rooms.find(({room}) => room.roomId === roomId);
    if (!room) return Promise.resolve(undefined);

    return Promise.resolve(roomMapper.toDomain(room));
  };

  const list = async () => {
    const rooms = await all();

    return Promise.resolve(rooms.map((room) => roomMapper.toDomain(room)));
  };

  const save = async (room: ERoom) => {
    const rooms = await all();
    let _roomIdx = rooms.findIndex(
      ({room: _room}) => _room.roomId === room.getRoomId(),
    );

    if (_roomIdx < 0) {
      const newRoom = roomMapper.toPersistence(room);
      rooms.push(newRoom);

      return db.set(DB_KEY, rooms).then(() => {
        return roomMapper.toDomain(newRoom);
      });
    }

    const updatedRoom = roomMapper.toPersistence(room);

    // - replace
    rooms[_roomIdx] = updatedRoom;

    return db.set(DB_KEY, rooms).then(() => room);
  };

  return {save, list, findById};
};
