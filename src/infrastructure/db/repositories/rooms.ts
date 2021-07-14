import {RedisClient} from 'redis';
import {Repository} from './types';
import {Room as ERoom} from 'domain/entities/room';
import {Room as DBRoom} from '../types';

import {promisify} from 'util';
import {roomMapper} from 'infrastructure/mapper/roomMapper';

type TRoomsRepository = Repository<ERoom> & {
  findById: (userId: string) => Promise<ERoom | undefined>;
  list: () => Promise<ERoom[]>;
};

export const RoomsRepository = (redis: RedisClient): TRoomsRepository => {
  const REDIS_KEY = 'rooms';
  const getAsync = promisify(redis.get).bind(redis);

  const all = () => {
    return getAsync(REDIS_KEY).then((rooms) => {
      if (!rooms) return [];
      const _rooms = JSON.parse(rooms);
      if (Array.isArray(_rooms)) return _rooms;
      return [_rooms];
    });
  };

  const findById = async (roomId: string) => {
    const rooms = await all();
    const room = rooms.find((room) => room.getRoomId() === roomId);
    if (!room) return Promise.resolve(undefined);

    return Promise.resolve(roomMapper.toDomain(room));
  };

  const list = async () => {
    const rooms = await all();

    return Promise.resolve(rooms.map((room) => roomMapper.toDomain(room)));
  };

  const save = async (room: ERoom) => {
    const rooms = await all();
    let _room = await findById(room.getRoomId());
    if (!_room) {
      const newRoom = roomMapper.toPersistence(room);
      rooms.push(newRoom);

      return new Promise<ERoom>((resolve, reject) => {
        redis.set(REDIS_KEY, JSON.stringify(rooms), (error) => {
          if (error) return reject(error);

          resolve(roomMapper.toDomain(newRoom!));
        });
      });
    }

    const updated = roomMapper.toPersistence(room);

    return new Promise<ERoom>((resolve, reject) => {
      redis.set(REDIS_KEY, JSON.stringify(updated), (error) => {
        if (error) return reject(error);
        resolve(room);
      });
    });
  };

  return {save, list, findById};
};
