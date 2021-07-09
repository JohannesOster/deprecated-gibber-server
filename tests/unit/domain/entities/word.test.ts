import {createUser} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';

describe('word', () => {
  describe('factory', () => {
    it('throws on too short word', () => {
      const tooShortWord = 't';
      const factory = () => createWord({word: tooShortWord});
      expect(factory).toThrowError(ValidationError);
    });

    it('throws on too long word', () => {
      const tooLongWord = 'abcdefghijklmnopqrstuvwxyz12345'; // 31 chars
      const factory = () => createWord({word: tooLongWord});
      expect(factory).toThrowError(ValidationError);
    });

    it('automatically assigns unique id', () => {
      const word = createWord({word: 'Dragon'});
      expect(word.wordId).toBeDefined();
    });
  });

  describe('upvote', () => {
    it('increases points on upvote', () => {
      const word = createWord({word: 'Dragon'});
      const user = createUser({username: 'Miriam die 2te'});

      const defaultPoints = word.retrievePoints();
      word.upvote(user.userId);

      expect(word.retrievePoints()).toBeGreaterThan(defaultPoints);
    });

    it('throws if upvote the same word twice', () => {
      const word = createWord({word: 'Drache'});
      const user = createUser({username: 'Garian'});
      const upvote = () => word.upvote(user.userId);
      word.upvote(user.userId);

      expect(upvote).toThrowError(InvalidOperationError);
    });
  });

  describe('downvote', () => {
    it('decreases points on downvote', () => {
      const word = createWord({word: 'Fußfessel'});
      const user = createUser({username: 'Tarantel'});

      const defaultPoints = word.retrievePoints();
      word.downvote(user.userId);

      expect(word.retrievePoints()).toBeLessThan(defaultPoints);
    });

    it('throws if upvote the same word twice', () => {
      const word = createWord({word: 'Gorgonzola'});
      const user = createUser({username: 'Jerasmin'});
      const downvote = () => word.downvote(user.userId);
      word.downvote(user.userId);

      expect(downvote).toThrowError(InvalidOperationError);
    });
  });

  describe('select', () => {
    it('set selectedBy on select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});

      word.select(user.userId);

      expect(word.selectedBy).toBe(user.userId);
    });

    it('update status on select', () => {
      const word = createWord({word: 'Autoschlüssel'});
      const user = createUser({username: 'Hubert'});

      word.select(user.userId);

      expect(word.status).toBe('selected');
    });

    it('throws on reselection by same user', () => {
      const word = createWord({word: 'Käse'});
      const user = createUser({username: 'Stefanius'});

      word.select(user.userId);

      const select = () => word.select(user.userId);
      expect(select).toThrowError(InvalidOperationError);
    });

    it('throws on reselection by different user', () => {
      const word = createWord({word: 'Drohne'});
      const peter = createUser({username: 'Peter'});
      const markus = createUser({username: 'Markus'});

      word.select(peter.userId);

      const select = () => word.select(markus.userId);
      expect(select).toThrowError(InvalidOperationError);
    });
  });

  describe('deselect', () => {
    it('remove selectedBy on select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});
      word.select(user.userId);

      word.deselect(user.userId);
      expect(word.selectedBy).toBeUndefined();
    });

    it('throws if word is not selected', () => {
      const word = createWord({word: 'Nuss'});
      const user = createUser({username: 'Nathalie'});

      const deselect = () => word.deselect(user.userId);
      expect(deselect).toThrowError(InvalidOperationError);
    });

    it('throws on deselect by different user', () => {
      const word = createWord({word: 'Drohne'});
      const peter = createUser({username: 'Peter'});
      const markus = createUser({username: 'Markus'});

      word.select(peter.userId);

      const deselect = () => word.deselect(markus.userId);
      expect(deselect).toThrowError(InvalidOperationError);
    });
  });

  describe('deselect', () => {
    it('remove selectedBy on select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});
      word.select(user.userId);

      word.deselect(user.userId);
      expect(word.selectedBy).toBeUndefined();
    });

    it('throws if word is not selected', () => {
      const word = createWord({word: 'Nuss'});
      const user = createUser({username: 'Nathalie'});

      const deselect = () => word.deselect(user.userId);
      expect(deselect).toThrowError(InvalidOperationError);
    });

    it('throws on deselect by different user', () => {
      const word = createWord({word: 'Drohne'});
      const peter = createUser({username: 'Peter'});
      const markus = createUser({username: 'Markus'});

      word.select(peter.userId);

      const deselect = () => word.deselect(markus.userId);
      expect(deselect).toThrowError(InvalidOperationError);
    });
  });

  describe('claim', () => {
    it('update status on claim', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});
      word.select(user.userId);
      word.claim(user.userId);

      expect(word.status).toBe('claimed');
    });

    it('throws on claim before select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});

      const claim = () => word.claim(user.userId);

      expect(claim).toThrowError(InvalidOperationError);
    });
  });
});
