import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { BotModel } from '@app/application/modules/bot/models/bot.model';

@Table
export class ChatBotModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  username: string;

  @Column
  bot_id: number;

  @BelongsTo(() => BotModel, 'bot_id')
  bot: BotModel;

  @Column
  @ForeignKey(() => ChatModel)
  chat_id: number;

  @BelongsTo(() => ChatModel)
  chat: ChatModel;

  @Column
  telegram_chat_id: number;
}
