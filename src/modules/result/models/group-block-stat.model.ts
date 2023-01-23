import {
  AutoIncrement,
  BelongsTo,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from '../../company/models/company.model';
import { GroupModel } from '../../company/models/group.model';
import { BlockModel } from '../../block/models/block.model';

@Table
export class GroupBlockStatModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  data: string;

  @Column
  percent: number;

  @Column
  week: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @BelongsTo(() => GroupModel, 'group_id')
  group: GroupModel;

  @BelongsTo(() => BlockModel, 'block_id')
  block: BlockModel;
}
