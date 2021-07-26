import {createUser} from 'domain/entities/user';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';
import {userMapper} from 'infrastructure/mapper';

export const UsersAdapter = (db: DBAccess) => {
  const register = httpReqHandler(async (req) => {
    const {username} = req.body;
    const user = await db.users.save(createUser({username}));
    const body = userMapper.toDTO(user);
    return {body};
  });

  return {register};
};
