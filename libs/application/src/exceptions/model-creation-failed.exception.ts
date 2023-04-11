import { Model } from 'sequelize-typescript';

export class ModelCreationFailedException<T extends Model> extends Error {
  constructor(private data: Record<string, any>, private model: T) {
    super();
  }
}
