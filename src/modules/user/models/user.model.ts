import {
  AutoIncrement,
  BelongsTo,
  Column,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { CompanyModel } from "../../company/models/company.model";
import { GroupModel } from "../../company/models/group.model";
import { BaseModel } from "../../base/base.provider";

@Table
export class UserModel extends BaseModel {
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

  @Column
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @Column
  group_id: number;

  @BelongsTo(() => GroupModel, 'group_id')
  group: GroupModel;
}
