import {
  AutoIncrement,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionMessageModel } from '@app/application/modules/distribution/models/distribution-message.model';
import { DistributionModel } from '@app/application/modules/distribution/models/distribution.model';

@Table
export class DistributionBlockModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  relative_id: number;

  @Column
  @ForeignKey(() => DistributionModel)
  distribution_id: number;

  // @BelongsToMany(
  //   () => DistributionMessageModel,
  //   () => DistributionMessageModel,
  //   'block_id',
  //   'id',
  // )
  @HasMany(() => DistributionMessageModel, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })
  messages: DistributionMessageModel[];
}
