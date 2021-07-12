import {Sequelize, DataTypes} from 'sequelize';
import {Model} from './types';

export default (sequelize: Sequelize) => {
  const Word = <Model>sequelize.define(
    'Word',
    {
      wordId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      word: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: 'word',
    },
  );

  Word.associate = (models) => {
    Word.belongsTo(models.Game);
  };

  return Word;
};
