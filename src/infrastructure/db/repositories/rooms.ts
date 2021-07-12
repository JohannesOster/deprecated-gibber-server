import {Room} from 'domain/entities/room';

export const RoomsRepository = (models: any) => {
  const create = (room: Room) => {
    return {} as any;
  };

  const retrieve = (roomId: string) => {
    return {} as any;
  };

  const list = () => {
    return {} as any;
  };

  return {create, retrieve, list};
};
