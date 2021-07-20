import {createGame} from 'domain/entities/game';
import {createWord} from 'domain/entities/word';

describe('room', () => {
  describe('factory', () => {
    it('automatically assigns unique id', () => {
      const game = createGame();
      expect(game.getGameId()).toBeDefined();
    });
  });

  describe('maxWords', () => {
    it('Pops oldest word if max is reached', () => {
      const word = createWord({word: 'Alfonso der Graue'});
      const game = createGame({
        words: new Array(100).fill(0).map(() => createWord({word: 'Filler'})),
      });

      game.addWord(createWord({word: 'Alfonso der Weiße'}));
      expect(game.getWord(word.getWordId())).toBeUndefined();
    });
  });

  describe('deleteWord', () => {
    it('Deletes word', () => {
      const word = createWord({word: 'Banana'});
      const game = createGame({words: [word]});

      game.deleteWord(word.getWordId());
      expect(game.getWord(word.getWordId())).toBeUndefined();
    });
  });
});
