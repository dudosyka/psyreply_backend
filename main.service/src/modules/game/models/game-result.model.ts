import {
  AutoIncrement,
  BelongsTo,
  Column,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserModel } from '../../user/models/user.model';
import { GameMetricModel } from './game-metric.model';
import { BaseModel } from "../../base/base.provider";

@Table
export class GameResultModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @BelongsTo(() => UserModel, 'user_id')
  user: UserModel;

  @BelongsTo(() => GameMetricModel, 'metric_id')
  metric: GameMetricModel;

  @Column
  value: number;
}
