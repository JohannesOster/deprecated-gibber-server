import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {errorHandler, notFound} from './middlewares';
import {RoomsRouter, UsersRouter} from './routes';
import {DBAccess} from 'infrastructure/db';

export const createHttpServer = (db: DBAccess) => {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  app.use(cors());

  app.use('/rooms', RoomsRouter(db));
  app.use('/users', UsersRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return server;
};
