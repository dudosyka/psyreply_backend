import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionBlockModel } from '@app/application/modules/distribution/models/distribution-block.model';
import { DistributionContactsModels } from '@app/application/modules/distribution/models/distribution-contacts.models';
import { UserModel } from '@app/application/modules/user/models/user.model';

@Table
export class DistributionModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  company_id: number;

  @Column({
    type: DataType.BIGINT,
  })
  next_call: number;

  @BelongsToMany(
    () => UserModel,
    () => DistributionContactsModels,
    'distribution_id',
    'user_id',
  )
  contacts: UserModel[];

  @Column
  onetime: boolean;

  @Column
  day_period: number;

  @Column
  send_time: string;

  // @BelongsToMany(
  //   () => DistributionBlockModel,
  //   () => DistributionBlockModel,
  //   'distribution_id',
  //   'id',
  // )
  @HasMany(() => DistributionBlockModel, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })
  blocks: DistributionBlockModel[];
}
