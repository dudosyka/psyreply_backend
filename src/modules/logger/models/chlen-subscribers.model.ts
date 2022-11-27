import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class ChlenSubscribersModel extends Model{
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number

  @Column
  email: string
}
