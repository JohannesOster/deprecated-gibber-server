import {RoomsAdapter} from 'application/rooms/adapter';
import {DBAccess} from 'infrastructure/db';
import {ConnectionDetails} from './socketEventHandler';
import {SocketEvent} from './types';

type EventHandler = {key: string; handler: (...args: any[]) => void};
export const createEventHandlers = (
  connectionDetails: ConnectionDetails,
  db: DBAccess,
): EventHandler[] => {
  const adapter = RoomsAdapter(db);

  return [
    {
      key: SocketEvent.selectWord,
      handler: (args) => adapter.selectWord(connectionDetails, args),
    },
    {
      key: SocketEvent.deselectWord,
      handler: (args) => adapter.deselectWord(connectionDetails, args),
    },
    {
      key: SocketEvent.claimWord,
      handler: (args) => adapter.claimWord(connectionDetails, args),
    },
    {
      key: SocketEvent.acceptClaim,
      handler: (args) => adapter.acceptClaim(connectionDetails, args),
    },
    {
      key: SocketEvent.denyClaim,
      handler: (args) => adapter.denyClaim(connectionDetails, args),
    },
    {
      key: SocketEvent.addWord,
      handler: (args) => adapter.addWord(connectionDetails, args),
    },
    {
      key: SocketEvent.upvoteWord,
      handler: (args) => adapter.upvoteWord(connectionDetails, args),
    },
    {
      key: SocketEvent.downvoteWord,
      handler: (args) => adapter.downvote(connectionDetails, args),
    },
    {
      key: SocketEvent.sendChatMessage,
      handler: (args) => adapter.sendChatMessage(connectionDetails, args),
    },
    {
      key: SocketEvent.requestChatMessages,
      handler: (args) => adapter.requestChatMessages(connectionDetails, args),
    },
    {
      key: SocketEvent.disconnect,
      handler: async (args) => adapter.leave(connectionDetails, args),
    },
  ];
};
