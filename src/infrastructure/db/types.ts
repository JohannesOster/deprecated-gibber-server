import {WordStatus} from 'domain/entities';
import {RoomsRepository, UsersRepository} from './repositories/';

export interface DBAccess {
  users: ReturnType<typeof UsersRepository>;
  rooms: ReturnType<typeof RoomsRepository>;
}

export interface Database {
  get: <T>(key: string) => Promise<T | undefined>;
  set: <T>(key: string, value: T) => Promise<undefined>;
  del: (key: string) => Promise<undefined>;
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
  room: {
    roomId: string;
    roomTitle: string;
    terminationDate: string;
    currentGameId?: string;
    players: Player[];
    chatMessages: ChatMessage[];
  };
  currentGame?: Game;
};
