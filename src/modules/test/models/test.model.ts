import { AutoIncrement, BelongsTo, BelongsToMany, Column, PrimaryKey, Table } from "sequelize-typescript";
import { UserModel } from "../../user/models/user.model";
import { QuestionTypeModel } from "../../question-type/models/question-type.model";
import { MetricModel } from "../../metric/models/metric.model";
import { QuestionModel } from "../../question/models/question.model";
import { BaseModel } from "../../base/base.provider";

@Table
export class TestModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  title: string;

  @BelongsTo(() => UserModel, "author_id")
  author: UserModel;

  @Column
  type_id: number;

  @BelongsTo(() => QuestionTypeModel, "type_id")
  type: QuestionTypeModel;

  @Column
  formula: string;

  @BelongsTo(() => MetricModel, "metric_id")
  metric: MetricModel;

  @BelongsToMany(() => QuestionModel, () => QuestionModel, "test_id", "id")
  questions: QuestionModel[];
}
