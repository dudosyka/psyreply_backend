import { BaseModel } from '../../base/base.provider';
import {
  AutoIncrement,
  Column,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '@app/application/modules/user/models/user.model';

@Table
export class BotUserModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  username: string;

  @Column
  bot_id: number;

  @Column
  @ForeignKey(() => UserModel)
  user_id: number;

  @Column
  chat_id: number;
}
