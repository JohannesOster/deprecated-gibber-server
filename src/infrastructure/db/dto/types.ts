export type User = {
  userId: string;
  username: string;
};

export type Word = {
  wordId: string;
  word: string;
};

export type ChatMessage = {
  chatMessageId: string;
  senderUserId: string;
  senderUsername: string; // TODO avoid duplication
  message: string;
  createdAt: number;
};

export type Room = {
  roomId: string;
  roomTitle: string;
};
