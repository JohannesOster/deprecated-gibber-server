import {createUser} from 'domain/entities/user';
import db from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpRequestHandler';

export const UsersAdapter = () => {
  const register = httpReqHandler(async (req) => {
    const {username} = req.body;
    const user = createUser({username});
    return {body: db.users.create(user)};
  });

  return {register};
};
