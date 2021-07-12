import {ModelCtor, Model as SModel} from 'sequelize';

export type Model = ModelCtor<SModel<any, any>> & {
  associate: (models: any) => void;
};
