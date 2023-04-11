import {
  AutoIncrement,
  BelongsTo,
  Column,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionModel } from './distribution.model';
import { DistributionMessageModel } from './distribution-message.model';

@Table
export class DistributionBlockModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  distribution_id: number;

  @BelongsTo(() => DistributionModel, 'distribution_id')
  distribution: DistributionModel;

  // @BelongsToMany(
  //   () => DistributionMessageModel,
  //   () => DistributionMessageModel,
  //   'block_id',
  //   'id',
  // )
  @HasMany(() => DistributionMessageModel)
  messages: DistributionMessageModel[];
}
