import {createChatMessage} from 'domain/entities/chatMessage';
import {Game} from 'domain/entities/game';
import {createRoom} from 'domain/entities/room';
import {createWord} from 'domain/entities/word';
import {DBAccess} from 'infrastructure/db';
import {httpReqHandler} from 'infrastructure/httpServer/httpRequestHandler';
import {roomMapper} from 'infrastructure/mapper/roomMapper';
import {SocketEvent} from 'infrastructure/socketServer';
import {socketEventHandler} from 'infrastructure/socketServer/socketEventHandler';
import {Server} from 'socket.io';

export const RoomsAdapter = (db: DBAccess) => {
  const create = httpReqHandler(async (req) => {
    const {roomTitle, terminationDate} = req.body;
    const room = createRoom({roomTitle, terminationDate});
    return {body: await db.rooms.save(room).then(roomMapper.toDTO)};
  });

  const list = httpReqHandler(async () => ({
    body: (await db.rooms.list()).map(roomMapper.toDTO),
  }));

  const selectWord = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');
      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');
      const word = currentGame.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.select(userId);
      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);
    },
  );

  const deselectWord = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');
      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.deselect(userId);
      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);
    },
  );

  const claimWord = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer, socket}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');

      word.claim(userId);
      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);

      socket.to(room.getRoomId()).emit(SocketEvent.claimWord, wordId);

      setTimeout(async () => {
        const room = await db.rooms.findById(roomId);
        if (!room) throw new Error('Room does not exist.');

        const currentGame = room.getCurrentGame();
        if (!currentGame) throw new Error('There is no current game.');

        const _user = room.getPlayer(userId);
        const _word = room.getCurrentGame()?.getWord(wordId);

        if (!_word || !_user || !currentGame) return;

        const sign = (_word.getPollResult() || 0) < 1 ? -1 : 1;
        const points = sign * _word.getPoints();
        _user.currentScore += points;

        currentGame.deleteWord(wordId);
        db.rooms.save(room);

        _listWords(socketIOServer, room.getRoomId(), currentGame);

        // loop through each connected socket
        socketIOServer.sockets.sockets.forEach((socket) => {
          const handshake = socket.handshake.query;
          if ((handshake.roomId as string) !== room.getRoomId()) return;
          const user = room.getPlayer((handshake.userId as string) || '');
          if (!user) return;
          socket.emit(SocketEvent.retrieveScore, {
            score: user.currentScore,
            highScore: room.getHighScore(),
          });
        });
      }, 3000);
    },
  );

  const acceptClaim = socketEventHandler<string>(
    async ({roomId, userId}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.accept(userId);
      db.rooms.save(room);
    },
  );

  const denyClaim = socketEventHandler<string>(
    async ({roomId, userId}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.deny(userId);
      db.rooms.save(room);
    },
  );

  const addWord = socketEventHandler<string>(
    async ({roomId, socketIOServer}, word) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');
      const _word = createWord({word});
      currentGame.addWord(_word);

      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);
    },
  );

  const upvoteWord = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.upvote(userId);
      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);
    },
  );

  const downvote = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer}, wordId) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      const currentGame = room.getCurrentGame();
      if (!currentGame) throw new Error('There is no current game.');

      const word = room.getCurrentGame()?.getWord(wordId);
      if (!word) throw new Error('Word does not exist.');
      word.downvote(userId);
      db.rooms.save(room);

      _listWords(socketIOServer, room.getRoomId(), currentGame);
    },
  );

  const sendChatMessage = socketEventHandler<string>(
    async ({roomId, userId, socketIOServer}, message) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');
      const user = room.getPlayer(userId)?.user;
      if (!user) throw new Error('User does not exist');
      const chatMessage = createChatMessage({
        message,
        senderUserId: userId,
        senderUsername: user.getUsername(),
      });
      room.sendChatMessage(chatMessage);
      db.rooms.save(room);

      socketIOServer
        .in(room.getRoomId())
        .emit(SocketEvent.listChatMessages, room.listChatMessages());
    },
  );

  const requestChatMessages = socketEventHandler<undefined>(
    async ({roomId, socket}) => {
      const room = await db.rooms.findById(roomId);
      if (!room) throw new Error('Room does not exist.');

      socket.emit(SocketEvent.listChatMessages, room.listChatMessages());
    },
  );

  const _listWords = (
    socketIOServer: Server,
    roomId: string,
    currentGame: Game,
  ) => {
    const words = currentGame.getWords().map((word) => ({
      word: word.getWord(),
      wordId: word.getWordId(),
      status: word.getStatus(),
      points: word.getPoints(),
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
    requestChatMessages,
  };
};
