import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class LoggerModel extends Model {
  @PrimaryKey
  @Column
  id: number

  @Column
  name: string

  @Column
  message: string

  @Column({ type: DataType.TEXT })
  stack: string
}
