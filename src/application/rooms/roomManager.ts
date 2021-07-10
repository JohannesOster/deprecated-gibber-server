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
  upvoteWord = 'upvoteWord',
  downvoteWord = 'downvoteWord',

  retrieveScore = 'retrieveScore',

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

    socket.emit(SocketEvent.connected, user); // successfully connected

    const words = _room
      .retrieveCurrentGame()
      ?.listWords()
      .map((word) => ({
        word: word.word,
        wordId: word.wordId,
        status: word.retrieveStatus(),
        points: word.retrievePoints(),
      }));
    socket.emit(SocketEvent.listWords, words);

    socketIOServer
      .in(_room.roomId)
      .emit(
        SocketEvent.retrieveScore,
        _room.retrieveCurrentGame()?.retrieveScore(user.userId),
      );

    socket.on(SocketEvent.selectWord, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.select(user.userId);

      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
    });

    socket.on(SocketEvent.deselectWord, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.deselect(user.userId);
      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
    });

    socket.on(SocketEvent.claimWord, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.claim(user.userId);

      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
      socket.to(_room.roomId).emit(SocketEvent.claimWord, wordId);

      setTimeout(() => {
        const _user = _room.retrieveUser(user.userId);
        const _word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
        const currentGame = _room.retrieveCurrentGame();

        if (!_word || !_user || !currentGame) return;

        const sign = (_word.retrievePollResult() || 0) < 1 ? -1 : 1;
        const points = sign * _word.retrievePoints();
        currentGame.updateScore(user.userId, points);

        currentGame.deleteWord(wordId);

        const words = currentGame.listWords().map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));

        socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);

        socketIOServer.sockets.sockets.forEach((socket) => {
          const handshake = socket.handshake.query;
          socket.emit(
            SocketEvent.retrieveScore,
            currentGame.retrieveScore((handshake.userId as string) || ''),
          );
        });
      }, 3000);
    });

    socket.on(SocketEvent.acceptClaim, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.accept(user.userId);
    });

    socket.on(SocketEvent.denyClaim, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.deny(user.userId);
    });

    socket.on(SocketEvent.addWord, (word) => {
      const _word = createWord({word});
      _room.retrieveCurrentGame()?.addWord(_word);

      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
    });

    socket.on(SocketEvent.upvoteWord, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.upvote(user.userId);

      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
    });

    socket.on(SocketEvent.downvoteWord, (wordId) => {
      const word = _room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) return;
      word.downvote(user.userId);

      const words = _room
        .retrieveCurrentGame()
        ?.listWords()
        .map((word) => ({
          word: word.word,
          wordId: word.wordId,
          status: word.retrieveStatus(),
          points: word.retrievePoints(),
        }));
      socketIOServer.in(_room.roomId).emit(SocketEvent.listWords, words);
    });

    socket.on(SocketEvent.disconnect, () => {
      _room.leave(user.userId);
    });
  };

  return {join};
};
