import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class GameMetricModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @Column
  name: string
}
