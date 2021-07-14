import {WordStatus} from 'domain/entities';
import {RoomsRepository} from './repositories/rooms';
import {UsersRepository} from './repositories/users';

export interface DBAccess {
  users: ReturnType<typeof UsersRepository>;
  rooms: ReturnType<typeof RoomsRepository>;
}

export type User = {
  userId: string;
  username: string;
};

export type Word = {
  wordId: string;
  word: string;
  selectedBy?: string;
  status: WordStatus;

  acceptedBy: string[];
  deniedBy: string[];
  upvotedBy: string[];
  downvotedBy: string[];
};

export type Game = {
  gameId: string;
  words: Word[];
};

export type ChatMessage = {
  chatMessageId: string;
  senderUserId: string;
  senderUsername: string; // TODO avoid duplication
  message: string;
};

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
  players: Player[];
  chatMessages: ChatMessage[];
};
