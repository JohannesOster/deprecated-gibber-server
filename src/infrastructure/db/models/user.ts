import {Sequelize, DataTypes} from 'sequelize';
import {Model} from './types';

export default (sequelize: Sequelize) => {
  const User = <Model>sequelize.define(
    'User',
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'user',
    },
  );

  User.associate = (models) => {
    User.belongsToMany(models.Room, {through: models.RoomMember});
  };

  return User;
};
