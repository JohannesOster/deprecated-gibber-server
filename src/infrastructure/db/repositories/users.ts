import {RedisClient} from 'redis';
import {User as EUser} from 'domain/entities/user';
import {User as DBUser} from '../types';
import {Repository} from './types';
import {userMapper} from 'infrastructure/mapper';

type TUserRepository = Repository<EUser> & {
  findById: (userId: string) => Promise<EUser | undefined>;
};

export const UsersRepository = (redis: RedisClient): TUserRepository => {
  const REDIS_KEY = 'users';

  const all = () => {
    return new Promise<DBUser[]>((resolve, reject) => {
      redis.get(REDIS_KEY, (error, result) => {
        if (error) return reject(error);
        if (!result) return resolve([]);
        const users = JSON.parse(result);
        /* If array has only one element JSON.parse returns this element as object. */
        if (!Array.isArray(users)) return resolve([users]);
        resolve(users);
      });
    });
  };

  const _findById = async (userId: string) => {
    return all().then((users) => users.find((user) => user.userId === userId));
  };

  const findById = async (userId: string) => {
    return _findById(userId).then((user) => {
      return user ? userMapper.toDomain(user) : undefined;
    });
  };

  const save = async (user: EUser) => {
    const users = await all();
    let _userIdx = users.findIndex(({userId}) => userId === user.getUserId());

    if (_userIdx < 0) {
      const timestamp = Date.now();
      const _user = userMapper.toPersistence(user);

      users.push(_user);
      return new Promise<EUser>((resolve, reject) => {
        redis.set(REDIS_KEY, JSON.stringify(users), (error) => {
          if (error) return reject(error);
          resolve(user);
        });
      });
    }

    // - fetch
    const _user = users[_userIdx];

    // - update
    const updatedUser = userMapper.toPersistence(user);
    // - replace
    users[_userIdx] = updatedUser;

    // - persist
    return new Promise<EUser>((resolve, reject) => {
      redis.set(REDIS_KEY, JSON.stringify(updatedUser), (error) => {
        if (error) return reject(error);
        resolve(userMapper.toDomain(updatedUser));
      });
    });
  };

  return {save, findById};
};
