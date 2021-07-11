import {Server as HttpServer} from 'http';
import {DBAccess} from 'infrastructure/db';
import {Server, Socket} from 'socket.io';
import {ConnectionDetails} from './socketEventHandler';
import {createEventHandlers} from './createEventHandlers';
import {SocketEvent} from './types';
import {createWord} from 'domain/entities/word';
import {createChatMessage} from 'domain/entities/chatMessage';

export const initializeSocketServer = (
  httpServer: HttpServer,
  db: DBAccess,
) => {
  const socketIOServer = new Server(httpServer);

  socketIOServer.on('connection', async (socket: Socket) => {
    type Query = {userId: string; roomId: string};
    const {userId, roomId} = socket.handshake.query as Query;

    try {
      const user = await db.users.retrieve(userId as string);
      if (!user) throw new Error('Can not join room prior to registration');

      const room = db.rooms.retrieve(roomId);
      if (!room) throw new Error('Room does not exist.');

      room.join(user);
      socket.join(room.roomId);
      socket.emit(SocketEvent.connected, user); // successfully connected

      // room.sendChatMessage(
      //   createChatMessage({
      //     senderUserId: user.userId,
      //     senderUsername: user.username,
      //     message: 'Testnmessage',
      //   }),
      // );

      // -- EVENT HANDLERS
      socket.on(SocketEvent.acceptClaim, (wordId) => {
        const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        if (!word) return;
        word.accept(user.userId);
      });

      socket.on(SocketEvent.denyClaim, (wordId) => {
        const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        if (!word) return;
        word.deny(user.userId);
      });

      socket.on(SocketEvent.addWord, (word) => {
        const _word = createWord({word});
        room.retrieveCurrentGame()?.addWord(_word);

        const words = room
          .retrieveCurrentGame()
          ?.listWords()
          .map((word) => ({
            word: word.word,
            wordId: word.wordId,
            status: word.retrieveStatus(),
            points: word.retrievePoints(),
          }));
        socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);
      });

      socket.on(SocketEvent.upvoteWord, (wordId) => {
        const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        if (!word) return;
        word.upvote(user.userId);

        const words = room
          .retrieveCurrentGame()
          ?.listWords()
          .map((word) => ({
            word: word.word,
            wordId: word.wordId,
            status: word.retrieveStatus(),
            points: word.retrievePoints(),
          }));
        socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);
      });

      socket.on(SocketEvent.downvoteWord, (wordId) => {
        const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        if (!word) return;
        word.downvote(user.userId);

        const words = room
          .retrieveCurrentGame()
          ?.listWords()
          .map((word) => ({
            word: word.word,
            wordId: word.wordId,
            status: word.retrieveStatus(),
            points: word.retrievePoints(),
          }));
        socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);
      });

      socket.on(SocketEvent.sendChatMessage, (message) => {
        const chatMessage = createChatMessage({
          message,
          senderUserId: user.userId,
          senderUsername: user.username,
        });
        room.sendChatMessage(chatMessage);
        socketIOServer
          .in(room.roomId)
          .emit(SocketEvent.listChatMessages, room.listChatMessages());
      });

      socket.on(SocketEvent.disconnect, () => {
        room.leave(user.userId);
      });
      // ------------- END

      // connect event handlers
      const cDetails: ConnectionDetails = {socketIOServer, socket, user, room};
      const eventHandlers = createEventHandlers(cDetails, db);
      eventHandlers.forEach(({key, handler}) => socket.on(key, handler));

      // initial steps after joining a room
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) return;
      socketIOServer
        .in(room.roomId)
        .emit(
          SocketEvent.retrieveScore,
          currentGame.retrieveScore(user.userId),
        );

      socketIOServer
        .in(room.roomId)
        .emit(SocketEvent.listChatMessages, room.listChatMessages());
    } catch (error) {
      console.error(error);
      socket.emit('error', error.message);
    }
  });
};
