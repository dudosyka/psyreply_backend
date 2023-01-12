import { AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../base/base.provider";

@Table
export class QuestionTypeModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;
}
