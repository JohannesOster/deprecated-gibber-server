import {RedisClient} from 'redis';
import {User as EUser} from 'domain/entities/user';
import {User as DBUser} from '../types';
import {Repository} from './types';
import {promisify} from 'util';
import {userMapper} from 'infrastructure/mapper';

type TUserRepository = Repository<EUser> & {
  findById: (userId: string) => Promise<EUser | undefined>;
};

export const UsersRepository = (redis: RedisClient): TUserRepository => {
  const REDIS_KEY = 'users';
  const getAsync = promisify(redis.get).bind(redis);

  const all = () => {
    return getAsync(REDIS_KEY).then((_users) => {
      return (_users ? JSON.parse(_users) : []) as DBUser[];
    });
  };

  const _findById = async (userId: string) => {
    const users = await all();
    return users.find((user) => user.userId === userId);
  };

  const findById = async (userId: string) => {
    const user = await _findById(userId);
    if (!user) return Promise.resolve(undefined);

    return Promise.resolve(userMapper.toDomain(user));
  };

  const save = async (user: EUser) => {
    let _user = await _findById(user.userId);
    const users = await all();

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

    const updatedUser = userMapper.toPersistence(user);
    updatedUser.updatedAt = Date.now();
    updatedUser.createdAt = _user.createdAt;

    return new Promise<EUser>((resolve, reject) => {
      redis.set(REDIS_KEY, JSON.stringify(updatedUser), (error) => {
        if (error) return reject(error);
        resolve(userMapper.toDomain(updatedUser!));
      });
    });
  };

  return {save, findById};
};
