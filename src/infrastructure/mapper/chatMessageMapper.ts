import {createChatMessage, ChatMessage as EChatMessage} from 'domain/entities';
import {ChatMessage as DBChatMessage} from 'infrastructure/db';
import {Mapper} from './types';

export const chatMessageMapper: Mapper<EChatMessage, DBChatMessage> = {
  toPersistence: (chatMessage) => {
    return {
      chatMessageId: chatMessage.chatMessageId,
      message: chatMessage.message,
      senderUserId: chatMessage.senderUserId,
      senderUsername: chatMessage.senderUsername,

      createdAt: chatMessage.createdAt,
      updatedAt: chatMessage.updatedAt,
    };
  },

  toDomain: (raw) => {
    return createChatMessage({
      chatMessageId: raw.chatMessageId,
      message: raw.message,
      senderUserId: raw.senderUserId,
      senderUsername: raw.senderUsername,

      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },
};
