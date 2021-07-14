import {createUser, User as EUser} from 'domain/entities/user';
import {User as DBUser} from 'infrastructure/db';
import {Mapper} from './types';

export const userMapper: Mapper<EUser, DBUser> = {
  toPersistence: (user) => {
    return {
      userId: user.getUserId(),
      username: user.getUsername(),
      createdAt: Date.now(), // TODO: fix
      updatedAt: Date.now(),
    };
  },

  toDomain: (raw) => {
    return createUser({
      userId: raw.userId,
      username: raw.username,
    });
  },
};
