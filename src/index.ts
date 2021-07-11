import {initializeDatabase} from 'infrastructure/db';
import {createServer} from 'infrastructure/server';
import pino from 'pino';

const logger = pino();

initializeDatabase().then((db) => {
  const port = process.env.PORT || 3000;

  const server = createServer(db);
  server.listen(port, () => {
    logger.info(`Listening on port ${port}`);
  });
});
