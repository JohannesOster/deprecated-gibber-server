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
      expect(room.roomId).toBeDefined();
    });
  });

  describe('join', () => {
    it('Adds user on join', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const user = createUser({username: 'Peter'});

      room.join(user);

      expect(room.retrieveUser(user.userId)).toEqual(user);
    });
  });

  describe('leave', () => {
    it('Removes user on leave', () => {
      const room = createRoom({roomTitle: 'VO Debatten der Gender Studies'});
      const user = createUser({username: 'Peter'});
      room.join(user);

      room.leave(user.userId);
      expect(room.retrieveUser(user.userId)).toBeUndefined();
    });

    it('Unselects words on leave', () => {
      const word = createWord({word: 'Schinken'});
      const room = createRoom({
        roomTitle: 'VO Debatten der Gender Studies',
        words: [word],
      });
      const user = createUser({username: 'Marianne'});
      room.join(user);
      word.select(user.userId);

      room.leave(user.userId);
      expect(room.retrieveWord(word.wordId)?.status).toBe('open');
    });
  });

  describe('maxWords', () => {
    it('Pops oldest word if max is reached', () => {
      const word = createWord({word: 'Alfonso der Graue'});
      const room = createRoom({
        roomTitle: 'VO Debatten der Gender Studies',
        maxWords: 1,
        words: [word],
      });

      room.addWord(createWord({word: 'Alfonso der Weiße'}));
      expect(room.retrieveWord(word.wordId)).toBeUndefined();
    });
  });

  describe('maxMembers', () => {
    it('Throws if max members is reached', () => {
      const room = createRoom({
        roomTitle: 'VO Debatten der Gender Studies',
        maxMembers: 2,
      });

      const addUser = () => room.join(createUser({username: 'Dumbledore'}));
      room.join(createUser({username: 'Snape'}));
      room.join(createUser({username: 'Harry'}));
      // source: https://youtu.be/Tx1XIm6q4r4?t=75

      expect(addUser).toThrow(InvalidOperationError);
    });
  });
});
