import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CompanyModel } from "../../company/models/company.model";

@Table
export class BlockModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string

    @Column
    company_id: number

    @BelongsTo(() => CompanyModel, "company_id")
    company: CompanyModel
}
