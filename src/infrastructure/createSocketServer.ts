import {roomManager} from 'application/rooms/roomManager';
import {createUser} from 'domain/entities/user';
import {Server as HttpServer} from 'http';
import {Server, Socket} from 'socket.io';

export const createSocketServer = (httpServer: HttpServer) => {
  const socketIOServer = new Server(httpServer);

  socketIOServer.on('connection', (socket: Socket) => {
    const {username, roomId} = socket.handshake.query;
    const user = createUser(username as string);
    const room = roomManager(socketIOServer, roomId as string);
    room.join({socket, user});
  });
};
