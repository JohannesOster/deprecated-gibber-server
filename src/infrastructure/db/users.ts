import {createUser, User} from 'domain/entities/user';
import {db} from '.';

export const UsersRepository = () => {
  const create = (user: User) => {
    db.run(`INSERT INTO user VALUES('${user.userId}', '${user.username}')`);
    return user;
  };

  const retrieve = async (userId: string) => {
    const user = (await new Promise((resolve, reject) =>
      db.get(`SELECT * FROM user WHERE userId=?`, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }),
    )) as any;
    return createUser({userId: user.userId, username: user.username});
  };

  const list = () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM user', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }).then((users: any) => {
      return users.map((user: any) =>
        createUser({username: user.username, userId: user.userId}),
      );
    });
  };

  return {create, retrieve, list};
};
