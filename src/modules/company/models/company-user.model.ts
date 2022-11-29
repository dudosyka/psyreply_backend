import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CompanyModel } from "./company.model";
import { UserModel } from "../../user/models/user.model";

@Table
export class CompanyUserModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number

  @BelongsTo(() => CompanyModel, "company_id")
  company: CompanyModel

  @BelongsTo(() => UserModel, "user_id")
  user: UserModel
}
