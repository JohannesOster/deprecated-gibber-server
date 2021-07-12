import {Room as TRoom} from 'domain/entities/room';
import {Model} from '../models/types';

export const RoomsRepository = (models: {[key: string]: Model}) => {
  const {Room} = models;
  const create = (room: TRoom) => {
    return Room.create({
      roomId: room.roomId,
      roomTitle: room.roomTitle,
    });
  };

  const retrieve = (roomId: string) => {
    return Room.findByPk(roomId);
  };

  const list = () => Room.findAll();

  return {create, retrieve, list};
};
