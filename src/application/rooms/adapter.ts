import db from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpRequestHandler';

export const RoomsAdapter = () => {
  const list = httpReqHandler(async () => {
    return {body: db.rooms.list()};
  });

  return {list};
};
