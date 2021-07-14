import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';

export type ChatMessage = {
  chatMessageId: string;
  senderUserId: string;
  senderUsername: string;
  message: string;
};

type InitialValues = {
  chatMessageId?: string;
  senderUserId: string;
  senderUsername: string;
  message: string;
};

export const createChatMessage = (init: InitialValues): ChatMessage => {
  const {chatMessageId = uuid(), senderUserId, senderUsername, message} = init;

  if (message.length < 1) {
    throw new ValidationError('Message requires at least one character.');
  }

  return {
    chatMessageId,
    senderUserId,
    senderUsername,
    message,
  };
};
