import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionMessageTypeModel } from './distribution-message-type.model';
import { DistributionBlockModel } from '@app/application/modules/distribution/models/distribution-block.model';

@Table
export class DistributionMessageModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  type_id: number;

  @Column
  @ForeignKey(() => DistributionBlockModel)
  block_id: number;

  @BelongsTo(() => DistributionMessageTypeModel, 'type_id')
  type: DistributionMessageTypeModel;

  @Column({
    type: DataType.TEXT,
  })
  content: string;
}
