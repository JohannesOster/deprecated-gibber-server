import {createGame} from 'domain/entities/game';
import {createUser} from 'domain/entities/user';
import {createWord} from 'domain/entities/word';
import {ValidationError} from 'domain/ValidationError';

describe('room', () => {
  describe('factory', () => {
    it('initializes scoreBoard', () => {
      const users = [
        createUser({username: 'Helene'}),
        createUser({username: 'Luis'}),
      ];
      const game = createGame({users});
      users.forEach(({userId}) => {
        expect(game.retrieveScore(userId)).toBe(0);
      });
    });

    it('automatically assigns unique id', () => {
      const users = [
        createUser({username: 'Helene'}),
        createUser({username: 'Luis'}),
      ];
      const game = createGame({users});
      expect(game.gameId).toBeDefined();
    });

    it('throws if less then two players are provided', () => {
      const users = [createUser({username: 'Helene'})];
      const factory = () => createGame({users});
      expect(factory).toThrow(ValidationError);
    });
  });

  describe('maxWords', () => {
    it('Pops oldest word if max is reached', () => {
      const users = [
        createUser({username: 'Helene'}),
        createUser({username: 'Luis'}),
      ];
      const word = createWord({word: 'Alfonso der Graue'});
      const game = createGame({maxWords: 1, words: [word], users});

      game.addWord(createWord({word: 'Alfonso der Weiße'}));
      expect(game.retrieveWord(word.wordId)).toBeUndefined();
    });
  });

  describe('deleteWord', () => {
    it('Deletes word', () => {
      const users = [
        createUser({username: 'Helene'}),
        createUser({username: 'Luis'}),
      ];
      const word = createWord({word: 'Banana'});
      const game = createGame({words: [word], users});

      game.deleteWord(word.wordId);
      expect(game.retrieveWord(word.wordId)).toBeUndefined();
    });
  });

  describe('updateScore', () => {
    it('updatesScore', () => {
      const users = [
        createUser({username: 'Helene'}),
        createUser({username: 'Luis'}),
      ];
      const game = createGame({users});

      const operand = 10;
      game.updateScore(users[0].userId, operand);
      expect(game.retrieveScore(users[0].userId)).toBe(operand);
    });
  });
});
