import {Database} from 'infrastructure/db';
import {RoomsRepository} from 'infrastructure/db/repositories';

const mockDB: Database = {
  get: jest.fn((key: string) => Promise.resolve(undefined)),
  set: jest.fn(<T>(key: string, value: T) => Promise.resolve(undefined)),
};

describe('roomsRepository', () => {
  describe('save', () => {
    it('saves new room', () => {
      const repo = RoomsRepository(mockDB);
    });
  });
});
