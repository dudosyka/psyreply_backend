import {Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table
export class CompanyModel extends Model {
    @PrimaryKey
    @Column
    id: number;

    @Column
    name: string
}
