import {createRoom} from 'domain/entities/room';
import {createUser} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import {Server as HttpServer} from 'http';
import {Server, Socket} from 'socket.io';
import {SocketEvent} from './SocketEvent';

export interface SocketServer {
  socketIOServer: Server;
  socket: Socket;
}

export const createSocketServer = (httpServer: HttpServer) => {
  const socketIOServer = new Server(httpServer);

  // initialize single room as long as room management is not implemented
  const room = createRoom({
    words: [createWord('Apfel'), createWord('Birne'), createWord('Schinken')],
  });

  socketIOServer.on('connection', (socket: Socket) => {
    const {username} = socket.handshake.query;

    const user = createUser(username as string);
    socket.join(room.roomId);
    room.join(user);

    socketIOServer.in(room.roomId).emit(SocketEvent.users, room.listUsers());
    socket.emit('connected', user); // successfully connected
    socket.emit(SocketEvent.words, room.listWords());

    socket.on(SocketEvent.select, (wordId) => {
      room.claim(user.userId, wordId);
      socketIOServer.in(room.roomId).emit(SocketEvent.words, room.listWords());
    });

    socket.on(SocketEvent.deselect, (wordId) => {
      room.deselect(user.userId, wordId);
      socketIOServer.in(room.roomId).emit(SocketEvent.words, room.listWords());
    });

    socket.on(SocketEvent.claim, (wordId) => {
      room.claim(user.userId, wordId);

      socketIOServer.in(room.roomId).emit(SocketEvent.words, room.listWords());
      socket.to(room.roomId).emit(SocketEvent.claim, wordId);

      setTimeout(() => {
        const _user = room.retrieveUser(user.userId);
        const _word = room.retrieveWord(wordId);
        if ((_word?.score || 0) < 1) _user?.decreaseScore();
        else _user?.increaseScore();
        room.reset(wordId);

        socketIOServer
          .in(room.roomId)
          .emit(SocketEvent.words, room.listWords());
        socketIOServer
          .in(room.roomId)
          .emit(SocketEvent.users, room.listUsers());
      }, 3000);
    });

    socket.on(SocketEvent.accept, (wordId) => {
      room.accept(user.userId, wordId);
    });

    socket.on(SocketEvent.deny, (wordId) => {
      room.deny(user.userId, wordId);
    });

    socket.on('disconnect', () => {
      room.leave(user.userId);
      socketIOServer.in(room.roomId).emit('users', room.listUsers());
    });
  });
};
