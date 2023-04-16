import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from './company.model';
import { UserModel } from '../../user/models/user.model';
import { BaseModel } from '../../base/base.provider';
import { UserGroupModel } from '@app/application/modules/company/models/user-group.model';

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

  @BelongsToMany(() => UserModel, () => UserGroupModel, 'group_id', 'user_id')
  users: UserModel[];
}
