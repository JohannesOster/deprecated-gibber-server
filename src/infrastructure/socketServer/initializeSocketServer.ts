import {roomManager} from 'application/rooms/roomManager';
import {Server as HttpServer} from 'http';
import {DBAccess} from 'infrastructure/db';
import {Server, Socket} from 'socket.io';

export const initializeSocketServer = (
  httpServer: HttpServer,
  db: DBAccess,
) => {
  const socketIOServer = new Server(httpServer);

  socketIOServer.on('connection', async (socket: Socket) => {
    const {userId, roomId} = socket.handshake.query;

    try {
      const user = await db.users.retrieve(userId as string);
      if (!user) throw new Error('Can not join room prior to registration');

      const room = roomManager(socketIOServer, roomId as string, db);
      room.join({socket, user});
    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    }
  });
};
