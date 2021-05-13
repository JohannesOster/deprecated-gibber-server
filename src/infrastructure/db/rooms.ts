import {Room} from 'domain/entities/room';

export const RoomsRepository = () => {
  const _rooms: Room[] = [];

  const create = (room: Room) => {
    _rooms.push(room);
    return room;
  };

  const retrieve = (roomId: string) => {
    return _rooms.find((room) => room.roomId === roomId);
  };

  const list = () => _rooms;

  return {create, retrieve, list};
};
