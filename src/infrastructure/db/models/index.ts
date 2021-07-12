import fs from 'fs';
import path from 'path';
import {Sequelize} from 'sequelize/types';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const createModels = (sequelize: Sequelize) => {
  const models: any = {};

  // Get all models
  const modelsList = fs
    .readdirSync(path.resolve(__dirname, './'))
    .filter(
      (t) => ~t.indexOf('.ts') && !~t.indexOf('index') && !~t.indexOf('types'),
    )
    .map((fileName) => {
      const model = require(`./${fileName}`).default(sequelize);
      return model;
    });

  // Camel case the models
  for (let i = 0; i < modelsList.length; i++) {
    const modelName = capitalize(modelsList[i].name);
    models[modelName] = modelsList[i];
  }

  // Create the relationships for the models;
  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  return models;
};
