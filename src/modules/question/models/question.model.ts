import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import {QuestionTypeModel} from "../../question-type/models/question-type.model";
import { TestModel } from "../../test/models/test.model";

@Table
export class QuestionModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    title: string

    @Column
    type_id: number

    @BelongsTo(() => QuestionTypeModel, "type_id")
    type: QuestionTypeModel

    @Column
    test_id: number

    @BelongsTo(() => TestModel, "test_id")
    test: TestModel

    @Column
    value: string

    @Column
    coins: number

    @Column
    picture: string
}
