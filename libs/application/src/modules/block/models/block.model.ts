import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from '../../company/models/company.model';
import { TestModel } from '../../test/models/test.model';
import { TestBlockModel } from '../../test-block/models/test-block.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class BlockModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  time: number;

  @Column
  week: number;

  @Column
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  @BelongsToMany(() => TestModel, () => TestBlockModel, 'block_id', 'test_id')
  tests: TestModel[];
}
