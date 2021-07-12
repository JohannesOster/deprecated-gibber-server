import {User} from 'domain/entities/user';

export const UsersRepository = (models: any) => {
  const create = (user: User) => {
    return {} as any;
  };

  const retrieve = (userId: string) => {
    return {} as any;
  };

  const list = () => {
    return {} as any;
  };

  return {create, retrieve, list};
};
