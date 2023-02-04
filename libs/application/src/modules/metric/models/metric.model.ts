import { BaseModel } from '../../base/base.provider';
import { AutoIncrement, Column, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export class MetricModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;
}
