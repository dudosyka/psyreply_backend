import {Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table
export class QuestionTypeModel extends Model {
    @PrimaryKey
    @Column
    id: number

    @Column
    name: string
}
