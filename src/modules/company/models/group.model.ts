import { AutoIncrement, BelongsTo, BelongsToMany, Column, PrimaryKey, Table } from "sequelize-typescript";
import { CompanyModel } from "./company.model";
import { UserModel } from "../../user/models/user.model";
import { BaseModel } from "../../base/base.provider";

@Table
export class GroupModel extends BaseModel {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @BelongsToMany(() => UserModel, () => UserModel, 'group_id', 'id')
  users: UserModel[];
}
