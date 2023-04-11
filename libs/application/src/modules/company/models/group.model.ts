import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from './company.model';
import { UserModel } from '../../user/models/user.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class GroupModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  @ForeignKey(() => CompanyModel)
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  // @BelongsToMany(() => UserModel, () => UserModel, 'group_id', 'id')
  @HasMany(() => UserModel)
  users: UserModel[];
}
