import {User as TUser} from 'domain/entities/user';
import {Model} from '../models/types';

export const UsersRepository = (models: {[key: string]: Model}) => {
  const {User} = models;
  const create = (user: TUser) => {
    return User.create({
      userId: user.userId,
      username: user.username,
    });
  };

  const retrieve = (userId: string) => {
    return User.findByPk(userId);
  };

  const list = () => User.findAll();

  return {create, retrieve, list};
};
