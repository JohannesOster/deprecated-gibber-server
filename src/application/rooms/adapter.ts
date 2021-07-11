import {createRoom} from 'domain/entities/room';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';
import {SocketEvent} from 'infrastructure/socketServer';
import {socketEventHandler} from 'infrastructure/socketServer/socketEventHandler';

export const RoomsAdapter = (db: DBAccess) => {
  const create = httpReqHandler(async (req) => {
    const {roomTitle} = req.body;
    const room = createRoom({roomTitle});
    return {body: db.rooms.create(room)};
  });

  const list = httpReqHandler(async () => ({body: db.rooms.list()}));

  const selectWord = socketEventHandler<{wordId: string}>(
    ({room, user, socketIOServer}, {wordId}) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');
      const word = currentGame.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.select(user.userId);

      const words = currentGame.listWords().map((word) => ({
        word: word.word,
        wordId: word.wordId,
        status: word.retrieveStatus(),
        points: word.retrievePoints(),
      }));
      socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);
    },
  );

  const deselectWord = socketEventHandler<{wordId: string}>(
    ({room, user, socketIOServer}, {wordId}) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.deselect(user.userId);
      const words = currentGame.listWords().map((word) => ({
        word: word.word,
        wordId: word.wordId,
        status: word.retrieveStatus(),
        points: word.retrievePoints(),
      }));
      socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);
    },
  );

  const claimWord = socketEventHandler<{wordId: string}>(
    ({room, user, socketIOServer, socket}, {wordId}) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.claim(user.userId);

      const words = currentGame.listWords().map((word) => ({
        word: word.word,
        wordId: word.wordId,
        status: word.retrieveStatus(),
        points: word.retrievePoints(),
      }));
      socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);

      socket.to(room.roomId).emit(SocketEvent.claimWord, wordId);

      setTimeout(() => {
        const _user = room.retrieveUser(user.userId);
        const _word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        const currentGame = room.retrieveCurrentGame();

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

        socketIOServer.in(room.roomId).emit(SocketEvent.listWords, words);

        // loop through each connected socker
        // TODO: only use those in this room
        socketIOServer.sockets.sockets.forEach((socket) => {
          const handshake = socket.handshake.query;
          socket.emit(
            SocketEvent.retrieveScore,
            currentGame.retrieveScore((handshake.userId as string) || ''),
          );
        });
      }, 3000);
    },
  );

  return {create, list, selectWord, deselectWord, claimWord};
};
