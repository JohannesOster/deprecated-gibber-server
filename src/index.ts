import {db} from 'infrastructure/db';
import {createServer} from 'infrastructure/server';

db.init().then((db) => {
  const port = process.env.PORT || 3000;

  const server = createServer(db);

  server.listen(port, () => {
    console.info(`Listening on port ${port}`);
  });
});
