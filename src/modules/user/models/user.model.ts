import {
  AutoIncrement,
  BelongsTo, BelongsToMany,
  Column, DataType,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { CompanyModel } from "../../company/models/company.model";
import { GroupModel } from "../../company/models/group.model";
import { BaseModel } from "../../base/base.provider";
import { MessageModel } from "../../bot/models/message.model";
import { UserMessageModel } from "../../bot/models/user-message.model";

@Table
export class UserModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({
    type: DataType.BIGINT
  })
  jetBotId: number;

  @Column
  login: string;

  @Column
  hash: string;

  @Column
  emailCode: string;

  @Column
  email: string;

  @Column
  isAdmin: boolean;

  @Column
  coins: number;

  @Column
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @Column
  group_id: number;

  @BelongsTo(() => GroupModel, 'group_id')
  group: GroupModel;

  @BelongsToMany(() => MessageModel, () => UserMessageModel, 'user_id', 'message_id')
  messages: MessageModel[]
}
