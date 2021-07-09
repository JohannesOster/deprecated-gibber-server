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
  upvoteWord = 'upvoteWord',
  downvoteWord = 'downvoteWord',

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
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.select(user.userId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.deselectWord, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.deselect(user.userId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.claimWord, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.claim(user.userId);

      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
      socket.to(_room.roomId).emit(SocketEvent.claimWord, wordId);

      setTimeout(() => {
        const _user = _room.retrieveUser(user.userId);
        const _word = _room.retrieveWord(wordId);

        if (!_word || !_user) return;

        const sign = (_word.retrievePollResult() || 0) < 1 ? -1 : 1;
        const points = sign * _word.retrievePoints();
        _user.addToScore(roomId, points);

        _room.deleteWord(wordId);

        socketIOServer
          .in(_room.roomId)
          .emit(SocketEvent.listWords, _room.listWords());
        socketIOServer
          .in(_room.roomId)
          .emit(SocketEvent.listUsers, _room.listUsers());
      }, 3000);
    });

    socket.on(SocketEvent.acceptClaim, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.accept(user.userId);
    });

    socket.on(SocketEvent.denyClaim, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.deny(user.userId);
    });

    socket.on(SocketEvent.addWord, (word) => {
      const _word = createWord(word);
      _room.addWord(_word);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.upvoteWord, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.upvote(wordId);
      socketIOServer
        .in(_room.roomId)
        .emit(SocketEvent.listWords, _room.listWords());
    });

    socket.on(SocketEvent.downvoteWord, (wordId) => {
      const word = _room.retrieveWord(wordId);
      if (!word) return;
      word.downvote(wordId);
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
