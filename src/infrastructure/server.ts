import express from 'express';
import {createServer as createHTTPServer} from 'http';
import {createSocketServer} from './createSocketServer';

const app = express();
const server = createHTTPServer(app);
createSocketServer(server);

app.get('/', (req, res) => {
  res.json('Hello world!');
});

export default server;
