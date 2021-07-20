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
      expect(user.getUserId()).toBeDefined();
    });
  });
});
