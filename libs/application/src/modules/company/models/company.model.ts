import {
  AutoIncrement,
  Column,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BlockModel } from '../../block/models/block.model';
import { UserModel } from '../../user/models/user.model';
import { GroupModel } from './group.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class CompanyModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  logo: string;

  // @BelongsToMany(() => BlockModel, () => BlockModel, 'company_id', 'id')
  @HasMany(() => BlockModel)
  blocks: BlockModel[];

  // @BelongsToMany(() => UserModel, () => UserModel, 'company_id', 'id')
  @HasMany(() => UserModel)
  users: UserModel[];

  // @BelongsToMany(() => GroupModel, () => GroupModel, 'company_id', 'id')
  @HasMany(() => GroupModel)
  groups: GroupModel[];
}
