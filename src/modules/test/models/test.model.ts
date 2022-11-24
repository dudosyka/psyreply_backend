import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import {UserModel} from "../../user/models/user.model";
import {QuestionTypeModel} from "../../question-type/models/question-type.model";
import {MetricModel} from "../../metric/models/metric.model";

@Table
export class TestModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number

    @Column
    title: string

    @BelongsTo(() => UserModel, "author_id")
    author: UserModel

    @Column
    type_id: number

    @BelongsTo(() => QuestionTypeModel, "type_id")
    type: QuestionTypeModel

    @Column
    formula: string

    @BelongsTo(() => MetricModel, "metric_id")
    metric: MetricModel
}
