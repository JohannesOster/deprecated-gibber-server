import {User as EUser} from 'domain/entities/user';
import {Database, User as DBUser} from '../types';
import {Repository} from './types';
import {userMapper} from 'infrastructure/mapper';

type TUserRepository = Repository<EUser> & {
  findById: (userId: string) => Promise<EUser | undefined>;
};

export const UsersRepository = (db: Database): TUserRepository => {
  const DB_KEY = 'users';

  const all = (): Promise<DBUser[]> => {
    return db.get(DB_KEY).then((result) => {
      if (!result) return [];
      return Array.isArray(result) ? result : [];
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
      const _user = userMapper.toPersistence(user);

      users.push(_user);

      return db.set(DB_KEY, users).then(() => {
        return userMapper.toDomain(_user);
      });
    }

    // - update
    const updatedUser = userMapper.toPersistence(user);
    // - replace
    users[_userIdx] = updatedUser;

    // - persist
    return db.set(DB_KEY, users).then(() => user);
  };

  return {save, findById};
};
