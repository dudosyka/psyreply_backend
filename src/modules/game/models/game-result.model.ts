import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UserModel } from "../../user/models/user.model";
import { GameMetricModel } from "./game-metric.model";

@Table
export class GameResultModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @BelongsTo(() => UserModel, "user_id")
  user: UserModel

  @BelongsTo(() => GameMetricModel, "metric_id")
  metric: GameMetricModel

  @Column
  value: number
}
