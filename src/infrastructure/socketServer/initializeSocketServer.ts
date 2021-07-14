import {Server as HttpServer} from 'http';
import {DBAccess} from 'infrastructure/db';
import {Server, Socket} from 'socket.io';
import {ConnectionDetails} from './socketEventHandler';
import {createEventHandlers} from './createEventHandlers';
import {SocketEvent} from './types';

export const initializeSocketServer = (
  httpServer: HttpServer,
  db: DBAccess,
) => {
  const socketIOServer = new Server(httpServer);

  socketIOServer.on('connection', async (socket: Socket) => {
    type Query = {userId: string; roomId: string};
    const {userId, roomId} = socket.handshake.query as Query;

    try {
      const user = await db.users.findById(userId as string);
      if (!user) throw new Error('Can not join room prior to registration');
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      room.join(user);
      db.rooms.save(room);

      socket.join(room.getRoomId());
      socket.emit(SocketEvent.connected, user); // successfully connected
      // room.sendChatMessage(
      //   createChatMessage({
      //     senderUserId: user.getUserId(),
      //     senderUsername: user.getUsername(),
      //     message: 'Testnmessage',
      //   }),
      // );
      // connect event handlers
      const cDetails: ConnectionDetails = {
        socketIOServer,
        socket,
        userId,
        roomId,
      };
      const eventHandlers = createEventHandlers(cDetails, db);
      eventHandlers.forEach(({key, handler}) => socket.on(key, handler));
      // initial steps after joining a room
      const currentGame = room.getCurrentGame();
      if (!currentGame) return;
      socket.emit(SocketEvent.retrieveScore, {
        highScore: room.getHighScore(),
        score: room.getPlayer(user.getUserId())?.currentScore,
      });

      socket.emit(SocketEvent.listChatMessages, room.listChatMessages());

      const words = currentGame.getWords().map((word) => ({
        word: word.getWord(),
        wordId: word.getWordId(),
        status: word.getStatus(),
        points: word.getPoints(),
      }));
      socket.emit(SocketEvent.listWords, words);
    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    }
  });
};
