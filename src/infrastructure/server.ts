import {createServer as createHTTPServer} from 'http';
import {createSocketServer} from './createSocketServer';

const server = createHTTPServer();
createSocketServer(server);

export default server;
