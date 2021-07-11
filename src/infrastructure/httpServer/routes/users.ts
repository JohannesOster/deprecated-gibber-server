import express from 'express';
import {UsersAdapter} from 'application/users/adapter';
import {body} from 'express-validator';
import {DBAccess} from 'infrastructure/db';

export const UsersRouter = (db: DBAccess) => {
  const adapter = UsersAdapter(db);
  const router = express.Router();

  router.post('/', [body('username').isString()], adapter.register);
  return router;
};
