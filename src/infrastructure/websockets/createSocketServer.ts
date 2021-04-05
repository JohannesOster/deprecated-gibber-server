import {Server as HttpServer} from 'http';
import {Server, Socket} from 'socket.io';

export interface SocketServer {
  socketIOServer: Server;
  socket: Socket;
}

export const createSocketServer = (httpServer: HttpServer) => {
  const socketIOServer = new Server(httpServer);
  socketIOServer.on('connection', (socket: Socket) => {
    console.log('New connection');
  });
};
