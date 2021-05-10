import {Room} from 'domain/entities/room';

export const RoomsRepository = () => {
  const _rooms: Room[] = [];

  const list = () => _rooms;

  return {list};
};
