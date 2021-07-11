import {createRoom} from 'domain/entities/room';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';

export const RoomsAdapter = (db: DBAccess) => {
  const create = httpReqHandler(async (req) => {
    const {roomTitle} = req.body;
    const room = createRoom({roomTitle});
    return {body: db.rooms.create(room)};
  });

  const list = httpReqHandler(async () => {
    return {body: db.rooms.list()};
  });

  return {create, list};
};
