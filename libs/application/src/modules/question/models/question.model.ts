import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { QuestionTypeModel } from '../../question-type/models/question-type.model';
import { TestModel } from '../../test/models/test.model';
import { BaseModel } from '../../base/base.provider';

@Table
export class QuestionModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  title: string;

  @Column
  type_id: number;

  @BelongsTo(() => QuestionTypeModel, 'type_id')
  type: QuestionTypeModel;

  @Column
  @ForeignKey(() => TestModel)
  test_id: number;

  @Column
  relative_id: number;

  @BelongsTo(() => TestModel, 'test_id')
  test: TestModel;

  @Column({
    type: DataType.TEXT,
  })
  value: string;

  @Column
  coins: number;

  @Column
  picture: string;
}
