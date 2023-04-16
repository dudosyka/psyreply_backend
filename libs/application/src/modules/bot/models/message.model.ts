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
import { BaseModel } from '../../base/base.provider';
import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';

@Table
export class MessageModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  type_id: number;

  @BelongsTo(() => MessageTypeModel, 'type_id')
  type: MessageTypeModel;

  @BelongsToMany(
    () => ChatModel,
    () => ChatMessageModel,
    'message_id',
    'chat_id',
  )
  chats: ChatModel;

  @Column({
    type: DataType.JSON,
  })
  content: string;
}
