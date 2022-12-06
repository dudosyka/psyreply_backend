import { AutoIncrement, BelongsTo, BelongsToMany, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { CompanyModel } from "../../company/models/company.model";
import { CompanyUserModel } from "../../company/models/company-user.model";
import { GroupModel } from "../../company/models/group.model";

@Table
export class UserModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  jetBotId: number;

  @Column
  login: string;

  @Column
  hash: string;

  @Column
  emailCode: string;

  @Column
  email: string;

  @Column
  isAdmin: boolean;

  @Column
  coins: number;

  @BelongsTo(() => CompanyModel, "company_id")
  company: CompanyModel;

  @BelongsToMany(() => GroupModel, () => CompanyUserModel, "user_id", "group_id")
  groups: GroupModel[];
}
