import {InvalidOperationError} from 'domain/InvalidOperationError';
import {createRoomTitle} from 'domain/valueObjects/roomTitle';
import {v4 as uuid} from 'uuid';
import {ChatMessage} from './chatMessage';
import {createGame, Game} from './game';
import {User} from './user';

type PlayerStatus = 'active' | 'away';
type Player = {
  status: PlayerStatus;
  currentScore: number;
  totalScore: number;
  user: User;
};

export type Room = {
  getRoomId: () => string;
  getRoomTitle: () => string;

  getCurrentGame: () => Game | undefined;

  getPlayer: (userId: string) => Player | undefined;
  getPlayers: () => Player[];

  getHighScore: () => number;

  join: (user: User) => void;
  leave: (userId: string) => void;

  sendChatMessage: (message: ChatMessage) => void;
  retrieveChatMessage: (messageId: string) => ChatMessage | undefined;
  listChatMessages: () => ChatMessage[];
};

type InitialValues = {
  roomId?: string;
  roomTitle: string;

  currentGame?: Game;
  players?: Player[];
  chatMessages?: ChatMessage[];
};

export const createRoom = (init: InitialValues): Room => {
  const MAX_PLAYERS = 100;

  const {roomId = uuid(), chatMessages = [], players: _players = []} = init;
  const roomTitle = createRoomTitle(init.roomTitle);
  let currentGame = init.currentGame;

  const getRoomId = () => roomId;
  const getRoomTitle = () => roomTitle.value();

  const getCurrentGame = () => currentGame;

  const getPlayers = () => _players;
  const getPlayer = (userId: string) => {
    return activePlayers().find(({user}) => user.getUserId() === userId);
  };

  const getHighScore = () => {
    const scores = _players.map(({currentScore}) => currentScore);
    return Math.max(...scores);
  };

  const join = (user: User) => {
    if (_players.length >= MAX_PLAYERS) {
      throw new InvalidOperationError(
        `Maximal amount of members (=${MAX_PLAYERS}) reached. Cannot join.`,
      );
    }

    const _player = _players.find(
      ({user: u}) => u.getUserId() === user.getUserId(),
    );

    if (!_player) {
      // If player joins for the first time create a new entry
      _players.push({user, status: 'active', totalScore: 0, currentScore: 0});
    } else _player.status = 'active'; // otherwise update status

    // If there are 2 active players a new game can start
    if (activePlayers().length >= 2 && !currentGame) {
      currentGame = createGame();
    }
  };

  const leave = (userId: string) => {
    const user = _players.find(({user}) => user.getUserId() === userId);
    if (!user) throw Error('Can not leave room you never joined.');

    user.status = 'away';

    if (activePlayers().length <= 1 && currentGame) {
      currentGame = undefined;
      return;
    }

    // reset all that are selected by leaving user
    currentGame?.getWords().forEach((word) => {
      if (word.getSelectedBy() !== userId) return;
      word.deselect(userId);
    });
  };

  const activePlayers = () => {
    return _players.filter(({status}) => status === 'active');
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

  return {
    getRoomId,
    getRoomTitle,
    getCurrentGame,

    getPlayer,
    getPlayers,
    getHighScore,

    join,
    leave,

    sendChatMessage,
    retrieveChatMessage,
    listChatMessages,
  };
};
