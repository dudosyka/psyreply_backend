import {BelongsTo, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {TestModel} from "../../test/models/test.model";
import {QuestionModel} from "../../question/models/question.model";

@Table
export class TestQuestionModel extends Model {
    @PrimaryKey
    @Column
    id: number;

    @BelongsTo(() => TestModel, "test_id")
    test: TestModel

    @BelongsTo(() => QuestionModel, "question_id")
    question: QuestionModel
}
