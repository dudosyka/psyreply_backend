import {
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class UserModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({
    type: DataType.BIGINT,
  })
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

  @Column
  group_id: number;
}
