import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MessageModel } from '@app/application/modules/bot/models/message.model';

@Table
export class ChatMessageModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  message_id: number;

  @BelongsTo(() => MessageModel, 'message_id')
  message: MessageModel;

  @Column
  chat_id: number;

  //0 - company-to-user, 1 - user-to-company
  @Column
  direction: number;
}
