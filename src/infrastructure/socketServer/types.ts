import {Socket} from 'socket.io';
import {User as UserEntity} from 'domain/entities/user';

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

  requestChatMessages = 'requestChatMessages',
  listChatMessages = 'listChatMessages',
  sendChatMessage = 'sendChatMessage',

  connected = 'connected',
  disconnect = 'disconnect',
}

export type User = {
  socket: Socket; // the socket connection of the user
  user: UserEntity;
};
