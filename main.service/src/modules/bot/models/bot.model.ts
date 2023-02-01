import { BaseModel } from "../../base/base.provider";
import { AutoIncrement, BelongsTo, BelongsToMany, Column, DataType, PrimaryKey, Table } from "sequelize-typescript";
import { CompanyModel } from "../../company/models/company.model";
import { UserModel } from "../../user/models/user.model";
import { BotUserModel } from "./bot-user.model";

@Table
export class BotModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string

  @Column
  token: string;

  @Column({
    type: DataType.BIGINT
  })
  telegram_id: number

  @Column
  company_id: number

  @BelongsToMany(() => UserModel, () => BotUserModel, 'bot_id', 'user_id')
  subscribers: UserModel[]

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel
}