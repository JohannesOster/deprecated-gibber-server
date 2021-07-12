import {Sequelize, DataTypes} from 'sequelize';
import {Model} from './types';

export default (sequelize: Sequelize) => {
  const Room = <Model>sequelize.define(
    'Room',
    {
      roomId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roomTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'room',
    },
  );

  Room.associate = (models) => {
    Room.belongsToMany(models.User, {through: models.RoomMember});
    Room.hasOne(models.Game);
  };

  return Room;
};
