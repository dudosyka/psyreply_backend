import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';

@Table
export class ChatNoteModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  chat_id: number;

  @BelongsTo(() => ChatModel, 'chat_id')
  chatBotModel: ChatModel;

  @Column({
    type: DataType.TEXT,
  })
  message: string;
}
