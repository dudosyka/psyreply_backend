import { AutoIncrement, BelongsTo, BelongsToMany, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { UserModel } from "./user.model";
import { DistributionRecipientsModel } from "./distribution-recipients.model";
import { DistributionBlockModel } from "./distribution-block.model";

@Table
export class DistributionModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  company_id: number;

  @BelongsToMany(() => UserModel, () => DistributionRecipientsModel, 'distribution_id', 'user_id')
  recipients: UserModel[]

  @Column
  first_block_id: number

  @BelongsTo(() => DistributionBlockModel, 'first_block_id')
  first_block: DistributionBlockModel
}