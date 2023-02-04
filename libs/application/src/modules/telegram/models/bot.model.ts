import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class BotModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  token: string;

  @Column({
    type: DataType.BIGINT,
  })
  telegram_id: number;

  @Column
  company_id: number;
}
