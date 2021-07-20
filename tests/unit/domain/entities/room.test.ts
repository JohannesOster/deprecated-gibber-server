import {createChatMessage} from 'domain/entities/chatMessage';
import {createRoom} from 'domain/entities/room';
import {createUser} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';

describe('room', () => {
  describe('factory', () => {
    it('throws on too short roomTitle', () => {
      const tooShortTitle = 'a';
      const factory = () => createRoom({roomTitle: tooShortTitle});
      expect(factory).toThrowError(ValidationError);
    });

    it('throws on too long roomTitle', () => {
      const tooLongTitle = 'abcdefghijklmnopqrstuvwxyz12345'; // 31 chars
      const factory = () => createRoom({roomTitle: tooLongTitle});
      expect(factory).toThrowError(ValidationError);
    });

    it('automatically assigns unique id', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      expect(room.getRoomId()).toBeDefined();
    });
  });

  describe('join', () => {
    it('Adds user on join', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const user = createUser({username: 'Peter'});

      room.join(user);

      expect(room.getPlayer(user.getUserId())?.user).toEqual(user);
    });

    it('Starts new game if second person joins', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const peter = createUser({username: 'Peter'});
      const jonathan = createUser({username: 'Jonathan'});

      room.join(peter);
      expect(room.getCurrentGame()).toBeUndefined();
      room.join(jonathan);
      expect(room.getCurrentGame()).toBeDefined();
    });
  });

  describe('leave', () => {
    it('removes user on leave', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const user = createUser({username: 'Peter'});
      room.join(user);

      room.leave(user.getUserId());
      expect(room.getPlayer(user.getUserId())).toBeUndefined();
    });

    it('deselects words on leave', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const marianne = createUser({username: 'Marianne'});
      const markus = createUser({username: 'Markus'});
      const chantal = createUser({username: 'Chantal'});

      // - join 3 users to keep game after leave
      room.join(marianne);
      room.join(markus);
      room.join(chantal);

      const word = createWord({word: 'Schinken'});
      room.getCurrentGame()?.addWord(word);

      word.select(marianne.getUserId());

      room.leave(marianne.getUserId());
      room.getCurrentGame()?.getWord(word.getWordId())?.getStatus();

      expect(
        room.getCurrentGame()?.getWord(word.getWordId())?.getStatus(),
      ).toBe('open');
    });

    it('removes current game if only one player is rest', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const marianne = createUser({username: 'Marianne'});
      const markus = createUser({username: 'Markus'});

      room.join(marianne);
      room.join(markus);

      room.leave(marianne.getUserId());

      expect(room.getCurrentGame()).toBeUndefined();
    });

    // it('updates users scores if currentGame ends', () => {
    //   const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
    //   const marianne = createUser({username: 'Marianne'});
    //   const markus = createUser({username: 'Markus'});

    //   room.join(marianne);
    //   room.join(markus);

    //   const score = 50;
    //   room.getPlayer(marianne.getUserId())!.currentScore = score;

    //   room.leave(markus.getUserId());

    //   expect(markus.(room.getRoomId())).toBe(0);
    //   expect(marianne.retrieveScore(room.getRoomId())).toBe(score);
    // });
  });

  describe('maxMembers', () => {
    it('Throws if max members is reached', () => {
      const room = createRoom({
        roomTitle: 'VO Debatten der Gender Studies',
      });

      const addUser = () => room.join(createUser({username: 'Dumbledore'}));
      room.join(createUser({username: 'Snape'}));
      room.join(createUser({username: 'Harry'}));

      new Array(98).fill(0).forEach(() => addUser());
      // source: https://youtu.be/Tx1XIm6q4r4?t=75

      expect(addUser).toThrow(InvalidOperationError);
    });
  });

  describe('sendChatMessage', () => {
    it('adds new message on sendChatMessage', () => {
      const room = createRoom({
        roomTitle: 'VO Debatten der Gender Studies',
      });
      const user = createUser({username: 'Maria'});
      room.join(user);

      const message = createChatMessage({
        senderUserId: user.getUserId(),
        senderUsername: user.getUsername(),
        message: 'Someone out there?',
      });

      room.sendChatMessage(message);

      expect(room.retrieveChatMessage(message.chatMessageId)).toBe(message);
    });
  });
});
