import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '@app/application/modules/user/models/user.model';

@Table
export class UserGroupModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  user_id: number;

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel;

  @Column
  group_id: number;
}
