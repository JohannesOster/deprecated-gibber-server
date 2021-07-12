import {Room} from 'domain/entities/room';
import {Database} from '../db';

export const RoomsRepository = (db: Database) => {
  const create = (room: Room) => {
    const params = [room.roomId, room.roomTitle, room.createdAt];
    const query = `INSERT INTO room VALUES(?,?,?)`;
    return db.run(query, params);
  };

  const retrieve = (roomId: string) => {
    const query = `SELECT * FROM room WHERE roomId=?`;
    return db.run(query, roomId);
  };

  const list = () => db.run('SELECT * FROM room');

  return {create, retrieve, list};
};
