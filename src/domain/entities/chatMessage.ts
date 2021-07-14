import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type ChatMessage = {
  chatMessageId: string;
  senderUserId: string;
  senderUsername: string;
  message: string;
  createdAt: number;
  updatedAt: number;
};

type InitialValues = {
  chatMessageId?: string;
  senderUserId: string;
  senderUsername: string;
  message: string;

  createdAt?: number;
  updatedAt?: number;
};

export const createChatMessage = (init: InitialValues): ChatMessage => {
  const {chatMessageId = uuid(), senderUserId, senderUsername, message} = init;
  const {createdAt = Date.now(), updatedAt = Date.now()} = init;

  if (message.length < 1) {
    throw new ValidationError('Message requires at least one character.');
  }

  return {
    chatMessageId,
    senderUserId,
    senderUsername,
    message,
    createdAt,
    updatedAt,
  };
};
