import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BotUserModel } from '@app/application/modules/bot/models/bot-user.model';

@Table
export class UserNoteModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  bot_user_model_id: number;

  @BelongsTo(() => BotUserModel, 'bot_user_model_id')
  bot_user_model: BotUserModel;

  @Column({
    type: DataType.TEXT,
  })
  message: string;
}
