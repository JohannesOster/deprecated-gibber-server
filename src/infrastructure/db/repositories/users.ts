import {createUser, User} from 'domain/entities/user';
import {Database} from '../db';

export const UsersRepository = (db: Database) => {
  const create = async ({username, userId}: User) => {
    const query = `INSERT INTO user VALUES($userId, $username);`;
    await db.run(query, {$userId: userId, $username: username});
    return retrieve(userId); // current sqlite3 version does not support returning clause
  };

  const retrieve = async (userId: string) => {
    const query = `SELECT * FROM user WHERE userId=$userId`;
    const user = await db.run(query, {$userId: userId});
    if (!user) return undefined;
    return createUser({userId: user.userId, username: user.username});
  };

  const list = async () => {
    const query = 'SELECT * FROM user';
    const users = await db.many(query);

    return users.map((user: any) =>
      createUser({username: user.username, userId: user.userId}),
    );
  };

  return {create, retrieve, list};
};
