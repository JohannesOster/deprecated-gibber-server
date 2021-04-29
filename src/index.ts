import server from 'infrastructure/server';
import pino from 'pino';

const logger = pino();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
