import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';
import {sortBy} from 'utilities';
import {v4 as uuid} from 'uuid';
import {createGame, Game} from './game';
import {User} from './user';

export type Room = {
  roomId: string;
  roomTitle: string;
  createdAt: number;
  /** Maximal number of users joining this room */
  maxMembers: number;
  /** The maximal number of words selectable in this room */
  maxWords: number;

  retrieveCurrentGame: () => Game | undefined;

  join: (user: User) => void;
  leave: (userId: string) => void;

  listUsers: () => User[];
  retrieveUser: (userId: string) => User | undefined;
};

type InitialValues = {
  roomId?: string;
  roomTitle: string;
  maxMembers?: number;
  maxWords?: number;
};

export const createRoom = (init: InitialValues): Room => {
  const {roomId = uuid(), roomTitle, maxMembers = 100, maxWords = 100} = init;
  type UserStatus = 'active' | 'away';
  const _users: {user: User; status: UserStatus}[] = [];
  const createdAt = Date.now();

  let currentGame: Game | undefined;

  // - Validation
  if (roomTitle.length < 3) {
    throw new ValidationError('RoomTitle must be at least 3 characters long.');
  }

  if (roomTitle.length > 30) {
    throw new ValidationError('RoomTitle must be at max 30 characters long.');
  }

  const join = (user: User) => {
    if (_users.length >= maxMembers) {
      throw new InvalidOperationError(
        `Maximal amount of members (=${maxMembers}) reached. Cannot join.`,
      );
    }

    const _user = _users.find(({user: u}) => u.userId === user.userId);
    if (!_user) _users.push({user, status: 'active'});
    else _user.status = 'active';

    if (activeUsers().length >= 2 && !currentGame) {
      currentGame = createGame({maxWords, users: _users.map(({user}) => user)});
    }
  };

  const retrieveCurrentGame = () => currentGame;

  const leave = (userId: string) => {
    const user = _users.find(({user}) => user.userId === userId);
    if (!user) throw Error('Can not leave room you never joined.');

    user.status = 'away';

    if (activeUsers().length <= 1 && currentGame) {
      const scoreBoard = currentGame?.retrieveScoreBoard();
      if (!scoreBoard) throw Error('Missing scoreboard.');

      _users.forEach(({user}) => {
        const score = scoreBoard[user.userId];
        user.addToScore(roomId, score);
      });

      currentGame = undefined;
      return;
    }

    // reset all that are selected by leaving user
    currentGame?.listWords().forEach((word) => {
      if (word.retrieveSelectedBy() !== userId) return;
      word.deselect(userId);
    });
  };

  const listUsers = () => {
    const users = activeUsers().map(({user}) => user);

    return sortBy(users, [
      {path: 'score', asc: false},
      {path: 'username', asc: true},
    ]);
  };

  const retrieveUser = (userId: string) => {
    return activeUsers().find(({user}) => user.userId === userId)?.user;
  };

  const activeUsers = () => {
    return _users.filter(({status}) => status === 'active');
  };

  return {
    roomId,
    roomTitle,
    createdAt,
    maxMembers,
    maxWords,
    retrieveCurrentGame,

    join,
    leave,

    listUsers,
    retrieveUser,
  };
};
