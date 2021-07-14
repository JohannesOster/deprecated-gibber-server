import {InvalidOperationError} from 'domain/InvalidOperationError';
import {ValidationError} from 'domain/ValidationError';
import {v4 as uuid} from 'uuid';
import {ChatMessage} from './chatMessage';
import {createGame, Game} from './game';
import {User} from './user';

type UserStatus = 'active' | 'away';
type _User = {
  status: UserStatus;
  currentScore: number;
  totalScore: number;
  user: User;
};

export type Room = {
  roomId: string;
  roomTitle: string;

  retrieveCurrentGame: () => Game | undefined;

  join: (user: User) => void;
  leave: (userId: string) => void;

  retrieveUser: (userId: string) => _User | undefined;
  listUsers: () => _User[];

  sendChatMessage: (message: ChatMessage) => void;
  retrieveChatMessage: (messageId: string) => ChatMessage | undefined;
  listChatMessages: () => ChatMessage[];

  retrieveHighScore: () => number;
};

type InitialValues = {
  roomId?: string;
  roomTitle: string;

  currentGame?: Game;
  users?: _User[];
  chatMessages?: ChatMessage[];
};

export const createRoom = (init: InitialValues): Room => {
  const {
    roomId = uuid(),
    roomTitle,
    chatMessages = [],
    users: _users = [],
  } = init;
  let currentGame = init.currentGame;
  const maxMembers = 100;
  const maxWords = 100;

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

    const _user = _users.find(
      ({user: u}) => u.getUserId() === user.getUserId(),
    );
    if (!_user) {
      _users.push({user, status: 'active', totalScore: 0, currentScore: 0});
    } else _user.status = 'active';

    if (activeUsers().length >= 2 && !currentGame) {
      currentGame = createGame();
    }
  };

  const retrieveCurrentGame = () => currentGame;

  const leave = (userId: string) => {
    const user = _users.find(({user}) => user.getUserId() === userId);
    if (!user) throw Error('Can not leave room you never joined.');

    user.status = 'away';

    if (activeUsers().length <= 1 && currentGame) {
      // const scoreBoard = currentGame?.retrieveScoreBoard();
      // if (!scoreBoard) throw Error('Missing scoreboard.');
      // _users.forEach(({user}) => {
      //   const score = scoreBoard[user.getUserId()];
      //   user.addToScore(roomId, score);
      // });
      //currentGame = undefined;
      // return;
    }

    // reset all that are selected by leaving user
    currentGame?.listWords().forEach((word) => {
      if (word.getSelectedBy() !== userId) return;
      word.deselect(userId);
    });
  };

  const retrieveUser = (userId: string) => {
    return activeUsers().find(({user}) => user.getUserId() === userId);
  };

  const listUsers = () => _users;

  const activeUsers = () => {
    return _users.filter(({status}) => status === 'active');
  };

  const sendChatMessage = (message: ChatMessage) => {
    chatMessages.push(message);
  };

  const retrieveChatMessage = (messageId: string) => {
    return chatMessages.find((message) => message.chatMessageId === messageId);
  };

  const listChatMessages = () => {
    return chatMessages;
  };

  const retrieveHighScore = () => {
    const scores = _users.map(({currentScore}) => currentScore);
    return Math.max(...scores);
  };

  return {
    roomId,
    roomTitle,
    retrieveCurrentGame,

    join,
    leave,

    retrieveUser,
    listUsers,

    sendChatMessage,
    retrieveChatMessage,
    listChatMessages,

    retrieveHighScore,
  };
};
