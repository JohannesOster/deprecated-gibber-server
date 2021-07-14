import {createChatMessage} from 'domain/entities/chatMessage';
import {Game} from 'domain/entities/game';
import {createRoom} from 'domain/entities/room';
import {createWord} from 'domain/entities/word';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';
import {SocketEvent} from 'infrastructure/socketServer';
import {socketEventHandler} from 'infrastructure/socketServer/socketEventHandler';
import {Server} from 'socket.io';

export const RoomsAdapter = (db: DBAccess) => {
  const create = httpReqHandler(async (req) => {
    const {roomTitle} = req.body;
    const room = createRoom({roomTitle});
    return {body: db.rooms.save(room)};
  });

  const list = httpReqHandler(async () => ({body: db.rooms.list()}));

  const selectWord = socketEventHandler<string>(
    ({room, user, socketIOServer}, wordId) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');
      const word = currentGame.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.select(user.userId);

      _listWords(socketIOServer, room.roomId, currentGame);
    },
  );

  const deselectWord = socketEventHandler<string>(
    ({room, user, socketIOServer}, wordId) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.deselect(user.userId);
      _listWords(socketIOServer, room.roomId, currentGame);
    },
  );

  const claimWord = socketEventHandler<string>(
    ({room, user, socketIOServer, socket}, wordId) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.claim(user.userId);

      _listWords(socketIOServer, room.roomId, currentGame);

      socket.to(room.roomId).emit(SocketEvent.claimWord, wordId);

      setTimeout(() => {
        const _user = room.retrieveUser(user.userId);
        const _word = room.retrieveCurrentGame()?.retrieveWord(wordId);
        const currentGame = room.retrieveCurrentGame();

        if (!_word || !_user || !currentGame) return;

        const sign = (_word.retrievePollResult() || 0) < 1 ? -1 : 1;
        const points = sign * _word.retrievePoints();
        _user.currentScore += points;

        currentGame.deleteWord(wordId);

        _listWords(socketIOServer, room.roomId, currentGame);

        // loop through each connected socker
        // TODO: only use those in this room
        socketIOServer.sockets.sockets.forEach((socket) => {
          const handshake = socket.handshake.query;
          socket.emit(
            SocketEvent.retrieveScore,
            room.retrieveUser((handshake.userId as string) || '')?.currentScore,
          );
        });
      }, 3000);
    },
  );

  const acceptClaim = socketEventHandler<string>(({room, user}, wordId) => {
    const currentGame = room.retrieveCurrentGame();
    if (!currentGame) throw new Error('There is no current game.');

    const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
    if (!word) throw new Error('Word does not exist.');
    word.accept(user.userId);
  });

  const denyClaim = socketEventHandler<string>(({room, user}, wordId) => {
    const currentGame = room.retrieveCurrentGame();
    if (!currentGame) throw new Error('There is no current game.');

    const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
    if (!word) throw new Error('Word does not exist.');
    word.deny(user.userId);
  });

  const addWord = socketEventHandler<string>(({room, socketIOServer}, word) => {
    const currentGame = room.retrieveCurrentGame();
    if (!currentGame) throw new Error('There is no current game.');
    const _word = createWord({word});
    currentGame.addWord(_word);

    _listWords(socketIOServer, room.roomId, currentGame);
  });

  const upvoteWord = socketEventHandler<string>(
    ({room, user, socketIOServer}, wordId) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.upvote(user.userId);

      _listWords(socketIOServer, room.roomId, currentGame);
    },
  );

  const downvote = socketEventHandler<string>(
    ({room, user, socketIOServer}, wordId) => {
      const currentGame = room.retrieveCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.retrieveCurrentGame()?.retrieveWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.downvote(user.userId);

      _listWords(socketIOServer, room.roomId, currentGame);
    },
  );

  const sendChatMessage = socketEventHandler<string>(
    ({room, user, socketIOServer}, message) => {
      const chatMessage = createChatMessage({
        message,
        senderUserId: user.userId,
        senderUsername: user.username,
      });
      room.sendChatMessage(chatMessage);
      socketIOServer
        .in(room.roomId)
        .emit(SocketEvent.listChatMessages, room.listChatMessages());
    },
  );

  const _listWords = (
    socketIOServer: Server,
    roomId: string,
    currentGame: Game,
  ) => {
    const words = currentGame.listWords().map((word) => ({
      word: word.word,
      wordId: word.wordId,
      status: word.retrieveStatus(),
      points: word.retrievePoints(),
    }));
    socketIOServer.in(roomId).emit(SocketEvent.listWords, words);
  };

  return {
    create,
    list,
    selectWord,
    deselectWord,
    claimWord,
    acceptClaim,
    denyClaim,
    addWord,
    upvoteWord,
    downvote,
    sendChatMessage,
  };
};
