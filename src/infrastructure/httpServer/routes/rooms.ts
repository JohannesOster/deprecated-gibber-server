import express from 'express';
import {RoomsAdapter} from 'application/rooms/adapter';
import {body} from 'express-validator';
import {DBAccess} from 'infrastructure/db';

export const RoomsRouter = (db: DBAccess) => {
  const adapter = RoomsAdapter(db);
  const router = express.Router();

  router.get('/', adapter.list);
  router.post('/', [body('roomTitle').isString()], adapter.create);
  return router;
};
