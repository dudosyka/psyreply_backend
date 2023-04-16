import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from '../../company/models/company.model';
import { GroupModel } from '../../company/models/group.model';
import { BlockModel } from '../../block/models/block.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class GroupBlockStatModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({
    type: DataType.TEXT,
  })
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
