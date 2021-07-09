import express from 'express';
import cors from 'cors';
import {createServer as createHTTPServer} from 'http';
import {createSocketServer} from './createSocketServer';
import {errorHandler, notFound} from './middlewares';
import {routes as RoomsRouter} from './routes/rooms';
import {routes as UsersRouter} from './routes/users';

const app = express();
const server = createHTTPServer(app);
createSocketServer(server);

app.use(express.json());
app.use(cors());

app.use('/rooms', RoomsRouter);
app.use('/users', UsersRouter);

app.use(notFound);
app.use(errorHandler);

export default server;
