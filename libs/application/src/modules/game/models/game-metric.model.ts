import { AutoIncrement, Column, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../../base/base.provider';

@Table
export class GameMetricModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;
}
