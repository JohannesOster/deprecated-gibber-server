import {User} from 'domain/entities/user';

export const UsersRepository = () => {
  const _users: User[] = [];

  const create = (user: User) => {
    _users.push(user);
    return user;
  };

  const retrieve = (userId: string) => {
    return _users.find((user) => user.userId === userId);
  };

  const list = () => _users;

  return {create, retrieve, list};
};
