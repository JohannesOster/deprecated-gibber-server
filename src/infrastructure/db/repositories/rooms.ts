import {RedisClient} from 'redis';
import {Repository} from './types';
import {Room as ERoom} from 'domain/entities/room';
import {Room as DBRoom} from '../types';

import {promisify} from 'util';
import {roomMapper} from 'infrastructure/mapper/roomMapper';

export const RoomsRepository = async (
  redis: RedisClient,
): Promise<{list: () => Promise<ERoom[]>} & Repository<ERoom>> => {
  const REDIS_KEY = 'rooms';
  const getAsync = promisify(redis.get).bind(redis);

  const rooms: DBRoom[] = await getAsync(REDIS_KEY).then((rooms) => {
    return rooms ? JSON.parse(rooms) : [];
  });

  const findById = (roomId: string): Promise<DBRoom | undefined> => {
    return Promise.resolve(rooms.find((room) => room.roomId === roomId));
  };

  const list = async () => {
    return Promise.resolve(rooms.map((room) => roomMapper.toDomain(room)));
  };

  const save = async (room: ERoom) => {
    let _room = await findById(room.roomId);
    if (!_room) {
      const timestamp = Date.now();
      _room = roomMapper.toPersistence(room);
      rooms.push(_room);

      return new Promise<ERoom>((resolve, reject) => {
        redis.set(REDIS_KEY, JSON.stringify(rooms), (error) => {
          if (error) return reject(error);

          resolve(roomMapper.toDomain(_room!));
        });
      });
    }

    const updated = roomMapper.toPersistence(room);
    updated.updatedAt = Date.now();

    return new Promise<ERoom>((resolve, reject) => {
      redis.set(REDIS_KEY, JSON.stringify(updated), (error) => {
        if (error) return reject(error);
        resolve(room);
      });
    });
  };

  return {save, list};
};
