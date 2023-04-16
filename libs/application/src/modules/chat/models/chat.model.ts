import {
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { UserModel } from '@app/application/modules/user/models/user.model';

@Table
export class ChatModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  @ForeignKey(() => UserModel)
  user_id: number;

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel;

  @Column
  company_id: number;

  @HasOne(() => ChatBotModel)
  bot_chat: ChatBotModel;
}
