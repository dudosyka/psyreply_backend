import { BaseModel } from "../../base/base.provider";
import { AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class MessageTypeModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string
}