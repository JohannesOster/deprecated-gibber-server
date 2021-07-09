import {createUser} from 'domain/entities/user';
import {ValidationError} from 'domain/ValidationError';

describe('user', () => {
  describe('factory', () => {
    it('throws on too short username', () => {
      const tooShortUsername = 'l';
      const factory = () => createUser({username: tooShortUsername});
      expect(factory).toThrowError(ValidationError);
    });

    it('throws on too long username', () => {
      const tooLongUsername = 'abcdefghijklmnopqrstuvwxyz12345'; // 31 chars
      const factory = () => createUser({username: tooLongUsername});
      expect(factory).toThrowError(ValidationError);
    });

    it('automatically assigns unique id', () => {
      const user = createUser({username: 'Dragon'});
      expect(user.userId).toBeDefined();
    });
  });

  describe('addToScore', () => {
    it('increases score by provided value', () => {
      const fakeRoomId = 'roomId';
      const score = 5;
      const user = createUser({username: 'Anastasia'});
      user.addToScore(fakeRoomId, score);
      expect(user.retrieveScore(fakeRoomId)).toBe(score);
    });

    it('decreases score by provided negative value', () => {
      const fakeRoomId = 'roomId';
      const score = -5;
      const user = createUser({username: 'Kepplin der 2te'});
      user.addToScore(fakeRoomId, score);
      expect(user.retrieveScore(fakeRoomId)).toBe(score);
    });
  });
});
