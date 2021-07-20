import {createUser, User as EUser} from 'domain/entities/user';
import {User as DBUser} from 'infrastructure/db';
import {User as DTOUser} from 'infrastructure/dto';
import {Mapper} from './types';

export const userMapper: Mapper<EUser, DBUser, DTOUser> = {
  toPersistence: (user) => {
    return {
      userId: user.getUserId(),
      username: user.getUsername(),
    };
  },

  toDomain: (raw) => {
    return createUser({
      userId: raw.userId,
      username: raw.username,
    });
  },

  toDTO: (user) => ({
    userId: user.getUserId(),
    username: user.getUsername(),
  }),
};
