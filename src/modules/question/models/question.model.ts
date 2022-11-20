import {BelongsTo, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {QuestionTypeModel} from "../../question-type/models/question-type.model";

@Table
export class QuestionModel extends Model {
    @PrimaryKey
    @Column
    id: number;

    @BelongsTo(() => QuestionTypeModel, "type_id")
    type: QuestionTypeModel

    @Column
    value: string

    @Column
    coins: number

    @Column
    picture: string
}
