import {createServer as createHTTPServer} from 'http';
import {createSocketServer} from './websockets';

const server = createHTTPServer();
createSocketServer(server);

export default server;
