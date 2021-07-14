import {RoomsRepository} from './repositories/rooms';
import {UsersRepository} from './repositories/users';

type AsyncReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any;

export interface DBAccess {
  users: AsyncReturnType<typeof UsersRepository>;
  rooms: AsyncReturnType<typeof RoomsRepository>;
}
type Timestamp = {
  createdAt: number;
  updatedAt: number;
};

export type User = {
  userId: string;
  username: string;
} & Timestamp;

export type Word = {
  wordId: string;
  word: string;
} & Timestamp;

export type Game = {
  gameId: string;
  words: Word[];
} & Timestamp;

export type ChatMessage = {
  chatMessageId: string;
  senderUserId: string;
  senderUsername: string; // TODO avoid duplication
  message: string;
} & Timestamp;

/* Nomenclature: Once a user joins a room for the first time he will turn into a player */
export type Player = {
  status: 'active' | 'away';
  currentScore: number;
  totalScore: number;
  user: User;
};

export type Room = {
  roomId: string;
  roomTitle: string;
  currentGame?: Game;
  users: Player[];
  chatMessages: ChatMessage[];
} & Timestamp;
