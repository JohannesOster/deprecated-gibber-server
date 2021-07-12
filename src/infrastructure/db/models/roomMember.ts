import {Sequelize, DataTypes} from 'sequelize';
import {Model} from './types';

export default (sequelize: Sequelize) => {
  const RoomMember = <Model>sequelize.define(
    'RoomMember',
    {
      userId: {
        type: DataTypes.UUID,
        references: {model: 'user', key: 'userId'},
      },
      roomId: {
        type: DataTypes.UUID,
        references: {model: 'room', key: 'roomid'},
      },
      totalScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      currentScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {timestamps: true, tableName: 'roomMember'},
  );

  return RoomMember;
};
