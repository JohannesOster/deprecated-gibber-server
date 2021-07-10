import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type ChatMassage = {
  chatMessageId: string;
  senderUserId: string;
  message: string;
  createdAt: number;
};

type InitialValues = {
  chatMessageId?: string;
  senderUserId: string;
  message: string;
};

export const createChatMessage = (init: InitialValues): ChatMassage => {
  const {chatMessageId = uuid(), senderUserId, message} = init;
  const createdAt = Date.now();

  if (message.length < 1) {
    throw new ValidationError('Message requires at least one character.');
  }

  return {
    chatMessageId,
    senderUserId,
    message,
    createdAt,
  };
};
