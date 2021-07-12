import {Sequelize} from 'sequelize';
import {createModels} from './models';

export const initializeDatabaseConnection = async () => {
  const filePath = './src/infrastructure/db/db.sqlite';
  const sequelize = new Sequelize({dialect: 'sqlite', storage: filePath});
  const models = createModels(sequelize);

  await sequelize.sync();

  return models;
};
