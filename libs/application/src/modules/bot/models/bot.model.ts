import { BaseModel } from '../../base/base.provider';
import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from '../../company/models/company.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';

@Table
export class BotModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  token: string;

  @Column({
    type: DataType.BIGINT,
  })
  telegram_id: number;

  @Column
  company_id: number;

  @BelongsToMany(() => ChatModel, () => ChatBotModel, 'bot_id', 'chat_id')
  subscribers: ChatModel[];

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;
}
