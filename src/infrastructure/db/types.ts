import {WordStatus} from 'domain/entities';
import {RoomsRepository} from './repositories/rooms';
import {UsersRepository} from './repositories/users';

export interface DBAccess {
  users: ReturnType<typeof UsersRepository>;
  rooms: ReturnType<typeof RoomsRepository>;
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
  selectedBy?: string;
  status?: WordStatus;

  _accepted: string[];
  _denied: string[];
  _upvotes: string[];
  _downvotes: string[];
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
