import { BaseModel } from "../../base/base.provider";
import { AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class BotUserModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  bot_id: number

  @Column
  user_id: number
}