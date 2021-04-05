import {createRoom} from 'domain/entities/room';
import {createUser} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import {Server as HttpServer} from 'http';
import {Server, Socket} from 'socket.io';

export interface SocketServer {
  socketIOServer: Server;
  socket: Socket;
}

export const createSocketServer = (httpServer: HttpServer) => {
  const socketIOServer = new Server(httpServer);

  // initialize single room as long as not room management is implemented
  const room = createRoom([
    createWord('Apfel'),
    createWord('Birne'),
    createWord('Schinken'),
  ]);

  socketIOServer.on('connection', (socket: Socket) => {
    const {username} = socket.handshake.query;
    const user = createUser(username as string);
    socket.join(room.roomId);
    room.join(user);

    socketIOServer.in(room.roomId).emit('users', room.getUsers());
    socket.emit('connected', user); // successfully connected
    socket.emit('words', room._words);

    socket.on('claim', (user, word) => {
      const _user = createUser(user.username, user.userId);
      room.claim(_user, word);

      socketIOServer.in(room.roomId).emit('words', room._words);
    });

    socket.on('unclaim', (user, word) => {
      const _user = createUser(user.username, user.userId);
      room.unclaim(_user, word);

      socketIOServer.in(room.roomId).emit('words', room._words);
    });

    socket.on('challange', (user, word) => {
      room.challange(createUser(user.username, user.userId), word);

      socketIOServer.in(room.roomId).emit('words', room._words);
      socket.to(room.roomId).emit('challange', word);

      setTimeout(() => {
        const _user = room.getUser(user?.userId);
        const _word = room.getWord(word);
        if ((_word?.score || 0) < 1) _user?.decreaseScore();
        else _user?.increaseScore();
        room.open(word);

        socketIOServer.in(room.roomId).emit('words', room._words);
        socketIOServer.in(room.roomId).emit('users', room.getUsers());
      }, 3000);
    });

    socket.on('accept', (user, word) => {
      const _user = createUser(user.username, user.userId);
      room.accept(_user, word);
    });

    socket.on('deny', (user, word) => {
      const _user = createUser(user.username, user.userId);
      room.deny(_user, word);
    });

    socket.on('disconnect', () => {
      room.leave(user);
      socketIOServer.in(room.roomId).emit('users', room.getUsers());
    });
  });
};
