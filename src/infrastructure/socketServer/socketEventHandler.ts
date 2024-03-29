import {Server, Socket} from 'socket.io';

export type ConnectionDetails = {
  socketIOServer: Server;
  socket: Socket;

  roomId: string;
  userId: string;
};

export type EventHandler<T> = (
  connectionDetails: ConnectionDetails,
  params: T,
) => void;

export const socketEventHandler = <T>(fn: EventHandler<T>): EventHandler<T> => {
  return (connectionDetails, params) => {
    try {
      return fn(connectionDetails, params);
    } catch (error) {
      console.error(error);
      connectionDetails.socket.emit('error', error);
    }
  };
};
