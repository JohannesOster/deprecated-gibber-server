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
      expect(word.getWordId()).toBeDefined();
    });
  });

  describe('upvote', () => {
    it('increases points on upvote', () => {
      const word = createWord({word: 'Dragon'});
      const user = createUser({username: 'Miriam die 2te'});

      const defaultPoints = word.getPoints();
      word.upvote(user.getUserId());

      expect(word.getPoints()).toBeGreaterThan(defaultPoints);
    });

    it('throws if upvote the same word twice', () => {
      const word = createWord({word: 'Drache'});
      const user = createUser({username: 'Garian'});
      const upvote = () => word.upvote(user.getUserId());
      word.upvote(user.getUserId());

      expect(upvote).toThrowError(InvalidOperationError);
    });

    it('removes downvote on upvote', () => {
      const word = createWord({word: 'Dragon'});
      const user = createUser({username: 'Miriam die 2te'});

      word.downvote(user.getUserId());
      word.upvote(user.getUserId());

      expect(word.getPoints()).toBe(2);
    });
  });

  describe('downvote', () => {
    it('decreases points on downvote', () => {
      const word = createWord({word: 'Fußfessel'});
      const user = createUser({username: 'Tarantel'});

      const defaultPoints = word.getPoints();
      word.downvote(user.getUserId());

      expect(word.getPoints()).toBeLessThan(defaultPoints);
    });

    it('throws if upvote the same word twice', () => {
      const word = createWord({word: 'Gorgonzola'});
      const user = createUser({username: 'Jerasmin'});
      const downvote = () => word.downvote(user.getUserId());
      word.downvote(user.getUserId());

      expect(downvote).toThrowError(InvalidOperationError);
    });

    it('removes upvote on downvote', () => {
      const word = createWord({word: 'Dragon'});
      const user = createUser({username: 'Miriam die 2te'});

      word.upvote(user.getUserId());
      word.downvote(user.getUserId());

      expect(word.getPoints()).toBe(0);
    });
  });

  describe('select', () => {
    it('set selectedBy on select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});

      word.select(user.getUserId());

      expect(word.getSelectedBy()).toBe(user.getUserId());
    });

    it('update status on select', () => {
      const word = createWord({word: 'Autoschlüssel'});
      const user = createUser({username: 'Hubert'});

      word.select(user.getUserId());

      expect(word.getStatus()).toBe('selected');
    });

    it('throws on reselection by same user', () => {
      const word = createWord({word: 'Käse'});
      const user = createUser({username: 'Stefanius'});

      word.select(user.getUserId());

      const select = () => word.select(user.getUserId());
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
      word.select(user.getUserId());

      word.deselect(user.getUserId());
      expect(word.getSelectedBy()).toBeUndefined();
    });

    it('throws if word is not selected', () => {
      const word = createWord({word: 'Nuss'});
      const user = createUser({username: 'Nathalie'});

      const deselect = () => word.deselect(user.getUserId());
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
      word.select(user.getUserId());

      word.deselect(user.getUserId());
      expect(word.getSelectedBy()).toBeUndefined();
    });

    it('throws if word is not selected', () => {
      const word = createWord({word: 'Nuss'});
      const user = createUser({username: 'Nathalie'});

      const deselect = () => word.deselect(user.getUserId());
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
      word.select(user.getUserId());
      word.claim(user.getUserId());

      expect(word.getStatus()).toBe('claimed');
    });

    it('throws on claim before select', () => {
      const word = createWord({word: 'Rauchschinken'});
      const user = createUser({username: 'Erbse'});

      const claim = () => word.claim(user.getUserId());

      expect(claim).toThrowError(InvalidOperationError);
    });
  });

  describe('accept', () => {
    it('updates poll result on accept', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const markus = createUser({username: 'Markus'});
      const severin = createUser({username: 'Severin'});
      word.select(markus.userId);
      word.claim(markus.userId);

      word.accept(severin.userId);
      expect(word.retrievePollResult()).toBe(1);
    });

    it('throws on accept unclaimed word', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const markus = createUser({username: 'Markus'});
      const severin = createUser({username: 'Severin'});

      word.select(markus.userId);
      const accept = () => word.accept(severin.userId);

      expect(accept).toThrowError(InvalidOperationError);
    });

    it('throws on accept selected word by selecting user', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const user = createUser({username: 'Markus'});

      word.select(user.getUserId());
      word.claim(user.getUserId());
      const accept = () => word.accept(user.getUserId());

      expect(accept).toThrowError(InvalidOperationError);
    });
  });

  describe('deny', () => {
    it('updates poll result on deny', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const markus = createUser({username: 'Markus'});
      const severin = createUser({username: 'Severin'});
      word.select(markus.userId);
      word.claim(markus.userId);

      word.deny(severin.userId);
      expect(word.retrievePollResult()).toBe(-1);
    });

    it('throws on deny unclaimed word', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const markus = createUser({username: 'Markus'});
      const severin = createUser({username: 'Severin'});

      word.select(markus.userId);
      const deny = () => word.deny(severin.userId);

      expect(deny).toThrowError(InvalidOperationError);
    });

    it('throws on deny selected word by selecting user', () => {
      const word = createWord({word: 'Fahrradpumpe'});
      const user = createUser({username: 'Markus'});

      word.select(user.getUserId());
      word.claim(user.getUserId());
      const deny = () => word.deny(user.getUserId());

      expect(deny).toThrowError(InvalidOperationError);
    });
  });
});
