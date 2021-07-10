import {createChatMessage} from 'domain/entities/chatMessage';
import {ValidationError} from 'domain/ValidationError';
import {v4} from 'uuid';

describe('ChatMessage', () => {
  describe('factory', () => {
    it('automatically assigns unique id', () => {
      const chatMessage = createChatMessage({
        senderUserId: v4(),
        message: 'Hey out there!',
      });
      expect(chatMessage.chatMessageId).toBeDefined();
    });

    it('throws if message is empty', () => {
      const factory = () =>
        createChatMessage({senderUserId: v4(), message: ''});
      expect(factory).toThrow(ValidationError);
    });
  });
});
