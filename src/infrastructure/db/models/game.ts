import {Sequelize, DataTypes} from 'sequelize';
import {Model} from './types';

export default (sequelize: Sequelize) => {
  const Game = <Model>sequelize.define(
    'Game',
    {
      gameId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    },
    {
      timestamps: true,
      tableName: 'game',
    },
  );

  Game.associate = (models) => {
    Game.belongsTo(models.Room);
    Game.hasMany(models.Word);
  };

  return Game;
};
