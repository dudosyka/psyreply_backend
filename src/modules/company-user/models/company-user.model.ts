import {BelongsTo, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {UserModel} from "../../user/models/user.model";
import {CompanyModel} from "../../company/models/company.model";

@Table
export class CompanyUserModel extends Model {
    @PrimaryKey
    @Column
    id: number

    @BelongsTo(() => UserModel, 'user_id')
    user: UserModel

    @BelongsTo(() => CompanyModel, 'company_id')
    company: CompanyModel
}
