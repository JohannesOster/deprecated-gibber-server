import {createUser, User as EUser} from 'domain/entities/user';
import {User as DBUser} from 'infrastructure/db';
import {Mapper} from './types';

export const userMapper: Mapper<EUser, DBUser> = {
  toPersistence: (user) => {
    return {
      userId: user.userId,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  toDomain: (raw) => {
    return createUser({
      userId: raw.userId,
      username: raw.username,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },
};
