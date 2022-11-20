import {Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table
export class MetricModel extends Model {
    @PrimaryKey
    @Column
    id: number

    @Column
    name: string
}
