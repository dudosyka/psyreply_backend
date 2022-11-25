import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import {UserModel} from "../../user/models/user.model";
import {BlockModel} from "../../block/models/block.model";
import { CompanyModel } from "../../company/models/company.model";

@Table
export class ResultModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number

    @BelongsTo(() => UserModel, "user_id")
    user: UserModel

    @Column
    data: string

    @BelongsTo(() => BlockModel, "block_id")
    block: BlockModel

    @BelongsTo(() => CompanyModel, "company_id")
    company: CompanyModel
}
