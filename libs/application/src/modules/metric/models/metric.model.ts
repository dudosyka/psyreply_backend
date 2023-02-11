import { BaseModel } from '../../base/base.provider';
import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class MetricModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;
  //ALTER TABLE `MetricModels` ADD `deleted` TINYINT(1) NOT NULL DEFAULT '0' AFTER `description`;
  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  deleted: boolean;
}
