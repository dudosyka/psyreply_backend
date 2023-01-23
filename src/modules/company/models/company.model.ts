import {
  AutoIncrement,
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BlockModel } from '../../block/models/block.model';
import { UserModel } from '../../user/models/user.model';
import { GroupModel } from './group.model';

@Table
export class CompanyModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @BelongsToMany(() => BlockModel, () => BlockModel, 'company_id', 'id')
  blocks: BlockModel[];

  @BelongsToMany(() => UserModel, () => UserModel, 'company_id', 'id')
  users: UserModel[];

  @BelongsToMany(() => GroupModel, () => GroupModel, 'company_id', 'id')
  groups: GroupModel[];
}
