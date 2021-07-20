import {RoomsAdapter} from 'application/rooms/adapter';
import {DBAccess} from 'infrastructure/db';
import {ConnectionDetails} from './socketEventHandler';
import {SocketEvent} from './types';

type EventHandler = {key: string; handler: (...args: any[]) => void};
export const createEventHandlers = (
  connectionDetils: ConnectionDetails,
  db: DBAccess,
): EventHandler[] => {
  const adapter = RoomsAdapter(db);

  return [
    {
      key: SocketEvent.selectWord,
      handler: (args) => adapter.selectWord(connectionDetils, args),
    },
    {
      key: SocketEvent.deselectWord,
      handler: (args) => adapter.deselectWord(connectionDetils, args),
    },
    {
      key: SocketEvent.claimWord,
      handler: (args) => adapter.claimWord(connectionDetils, args),
    },
    {
      key: SocketEvent.acceptClaim,
      handler: (args) => adapter.acceptClaim(connectionDetils, args),
    },
    {
      key: SocketEvent.denyClaim,
      handler: (args) => adapter.denyClaim(connectionDetils, args),
    },
    {
      key: SocketEvent.addWord,
      handler: (args) => adapter.addWord(connectionDetils, args),
    },
    {
      key: SocketEvent.upvoteWord,
      handler: (args) => adapter.upvoteWord(connectionDetils, args),
    },
    {
      key: SocketEvent.downvoteWord,
      handler: (args) => adapter.downvote(connectionDetils, args),
    },
    {
      key: SocketEvent.sendChatMessage,
      handler: (args) => adapter.sendChatMessage(connectionDetils, args),
    },
    {
      key: SocketEvent.requestChatMessages,
      handler: (args) => adapter.requestChatMessages(connectionDetils, args),
    },
    {
      key: SocketEvent.disconnect,
      handler: async () => {
        const {roomId, userId, socketIOServer} = connectionDetils;
        const room = await db.rooms.findById(roomId);
        if (!room) return;
        room.leave(userId);
        db.rooms.save(room);
        const currentGame = room.getCurrentGame();
        if (!currentGame) return;
        const words = currentGame.getWords().map((word) => ({
          word: word.getWord(),
          wordId: word.getWordId(),
          status: word.getStatus(),
          points: word.getPoints(),
        }));
        socketIOServer.in(roomId).emit(SocketEvent.listWords, words);
      },
    },
  ];
};
