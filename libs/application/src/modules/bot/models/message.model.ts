import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MessageTypeModel } from './message-type.model';
import { UserModel } from '../../user/models/user.model';
import { UserMessageModel } from './user-message.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class MessageModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column({
    type: DataType.BIGINT,
  })
  bot_message_id: number;

  @Column
  type_id: number;

  @BelongsTo(() => MessageTypeModel, 'type_id')
  type: MessageTypeModel;

  @BelongsToMany(
    () => UserModel,
    () => UserMessageModel,
    'message_id',
    'user_id',
  )
  author: UserModel;

  @Column({
    type: DataType.JSON,
  })
  content: string;
}
