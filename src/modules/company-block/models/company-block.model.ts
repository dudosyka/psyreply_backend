import {BelongsTo, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {BlockModel} from "../../block/models/block.model";
import {CompanyModel} from "../../company/models/company.model";

@Table
export class CompanyBlockModel extends Model {
    @PrimaryKey
    @Column
    id: number;

    @BelongsTo(() => BlockModel, 'block_id')
    block: BlockModel

    @BelongsTo(() => CompanyModel, 'company_id')
    company: CompanyModel
}
