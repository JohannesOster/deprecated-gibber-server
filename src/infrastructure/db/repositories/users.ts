import {RedisClient} from 'redis';
import {User as EUser} from 'domain/entities/user';
import {User as DBUser} from '../types';
import {Repository} from './types';
import {promisify} from 'util';
import {userMapper} from 'infrastructure/mapper';

export const UsersRepository = async (
  redis: RedisClient,
): Promise<Repository<EUser>> => {
  const REDIS_KEY = 'users';
  const getAsync = promisify(redis.get).bind(redis);

  const users: DBUser[] = await getAsync(REDIS_KEY).then((_users) => {
    return _users ? JSON.parse(_users) : [];
  });

  const findById = (userId: string): Promise<DBUser | undefined> => {
    return Promise.resolve(users.find((user) => user.userId === userId));
  };

  const save = async (user: EUser) => {
    let _user = await findById(user.userId);

    if (!_user) {
      const timestamp = Date.now();
      _user = {
        userId: user.userId,
        username: user.username,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      users.push(_user);
      return new Promise<EUser>((resolve, reject) => {
        redis.set(REDIS_KEY, JSON.stringify(users), (error) => {
          if (error) return reject(error);

          resolve(userMapper.toDomain(_user!));
        });
      });
    }

    const updated = userMapper.toPersistence(user);
    updated.updatedAt = Date.now();

    return new Promise<EUser>((resolve, reject) => {
      redis.set(REDIS_KEY, JSON.stringify(updated), (error) => {
        if (error) return reject(error);
        resolve(user);
      });
    });
  };

  return {save};
};
