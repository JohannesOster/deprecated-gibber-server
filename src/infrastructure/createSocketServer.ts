import {roomManager} from 'application/rooms/roomManager';
import {createUser} from 'domain/entities/user';
import {Server as HttpServer} from 'http';
import {Server, Socket} from 'socket.io';

export const createSocketServer = (httpServer: HttpServer) => {
  const socketIOServer = new Server(httpServer);

  const room = roomManager(socketIOServer);

  socketIOServer.on('connection', (socket: Socket) => {
    const {username} = socket.handshake.query;
    const user = createUser(username as string);
    room.join({socket, user});
  });
};
