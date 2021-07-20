import {createRoom} from 'domain/entities';
import {Database} from 'infrastructure/db';
import {RoomsRepository} from 'infrastructure/db/repositories';
import {roomMapper} from 'infrastructure/mapper/roomMapper';
import {v4 as uuid} from 'uuid';

const mockDB: Database = {
  get: jest.fn((key: string) => Promise.resolve(undefined)),
  set: jest.fn(<T>(key: string, value: T) => Promise.resolve(undefined)),
  del: jest.fn((key: string) => Promise.resolve(undefined)),
};

describe('roomsRepository', () => {
  describe('save', () => {
    it('saves new room', async () => {
      const repo = RoomsRepository(mockDB);
      const room = createRoom({
        roomId: uuid(),
        roomTitle: 'VO Plastische Chirurgie',
      });

      await repo.save(room);

      const {room: _room} = roomMapper.toPersistence(room);
      const args = [_room];
      expect(mockDB.set).toBeCalledWith('rooms', args);
    });
  });
});
