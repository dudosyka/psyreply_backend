import { BaseModel } from "../../base/base.provider";
import { AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class UserMessageModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  user_id: number

  @Column
  message_id: number

  @Column
  recipient_id: number
}