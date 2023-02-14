import { BaseModel } from '../../base/base.provider';
import {
  AutoIncrement,
  BelongsTo,
  Column,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MessageModel } from './message.model';

@Table
export class UserMessageModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  user_id: number;

  @Column
  message_id: number;

  @BelongsTo(() => MessageModel, 'message_id')
  message: MessageModel;

  @Column
  recipient_id: number;
}
