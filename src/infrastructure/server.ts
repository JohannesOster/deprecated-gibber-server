import {DBAccess} from './db';
import {createHttpServer} from './httpServer';
import {initializeSocketServer} from './socketServer';

export const createServer = (db: DBAccess) => {
  const server = createHttpServer(db);
  initializeSocketServer(server, db);
  return server;
};
