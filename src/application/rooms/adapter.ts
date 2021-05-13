import {createRoom} from 'domain/entities/room';
import db from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpRequestHandler';

export const RoomsAdapter = () => {
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
