import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionMessageTypeModel } from './distribution-message-type.model';

@Table
export class DistributionMessageModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  type_id: number;

  @Column
  block_id: number;

  @BelongsTo(() => DistributionMessageTypeModel, 'type_id')
  type: DistributionMessageTypeModel;

  @Column({
    type: DataType.TEXT,
  })
  content: string;
}
