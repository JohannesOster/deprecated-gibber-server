import express from 'express';
import {createServer as createHTTPServer} from 'http';
import {createSocketServer} from './createSocketServer';
import {routes as RoomsRouter} from './routes/rooms';

const app = express();
const server = createHTTPServer(app);
createSocketServer(server);

app.use('/rooms', RoomsRouter);

export default server;
