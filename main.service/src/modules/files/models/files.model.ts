import { AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript";
import { BaseModel } from "../../base/base.provider";

@Table
export class FilesModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  path: string
}