import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from './company.model';
import { UserModel } from '../../user/models/user.model';

@Table
export class GroupModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @BelongsToMany(() => UserModel, () => UserModel, 'group_id', 'id')
  users: UserModel[];
}
