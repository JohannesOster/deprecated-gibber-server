import {User as UserEntity} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import db from 'infrastructure/db';
import {Server, Socket} from 'socket.io';

export enum SocketEvent {
  selectWord = 'selectWord',
  deselectWord = 'deselectWord',
  claimWord = 'claimWord',
  acceptClaim = 'acceptClaim',
  denyClaim = 'denyClaim',
  addWord = 'addWord',
  listWords = 'listWords',
  listUsers = 'listUsers',

  connected = 'connected',
  disconnect = 'disconnect',
}

export type User = {
  socket: Socket; // the socket connection of the user
  user: UserEntity;
};

export const roomManager = (socketIOServer: Server, roomId: string) => {
  const _room = db.rooms.retrieve(roomId)!;

  const join = ({socket, user}: User) => {
    socket.join(_room.roomId);
    _room.join(user);

    socketIOServer
      .in(_room.roomId)
      .emit(SocketEvent.listUsers, _room.listUsers());
    socket.emit(SocketEvent.connected, user); // successfully connected
    socket.emit(SocketEvent.listWords, _room.listWords());

    socket.on(SocketEvent.selectWord, (wordId) => {
      _room.select(user.userId, wordId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.deselectWord, (wordId) => {
      _room.deselect(user.userId, wordId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.claimWord, (wordId) => {
      _room.claim(user.userId, wordId);

      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
      socket.to(_room.roomId).emit(SocketEvent.claimWord, wordId);

      setTimeout(() => {
        const _user = _room.retrieveUser(user.userId);
        const _word = _room.retrieveWord(wordId);
        if ((_word?.score || 0) < 1) _user?.decreaseScore();
        else _user?.increaseScore();
        _room.reset(wordId);

        socketIOServer
          .in(_room.roomId)
          .emit(SocketEvent.listWords, _room.listWords());
        socketIOServer
          .in(_room.roomId)
          .emit(SocketEvent.listUsers, _room.listUsers());
      }, 3000);
    });

    socket.on(SocketEvent.acceptClaim, (wordId) => {
      _room.accept(user.userId, wordId);
    });

    socket.on(SocketEvent.denyClaim, (wordId) => {
      _room.deny(user.userId, wordId);
    });

    socket.on(SocketEvent.addWord, (word) => {
      const _word = createWord(word);
      _room.addWord(_word);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.disconnect, () => {
      _room.leave(user.userId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listUsers, _room.listUsers());
    });
  };

  return {join};
};
