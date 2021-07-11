import {createUser} from 'domain/entities/user';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';

export const UsersAdapter = (db: DBAccess) => {
  const register = httpReqHandler(async (req) => {
    const {username} = req.body;
    const user = createUser({username});
    return {body: await db.users.create(user)};
  });

  return {register};
};
