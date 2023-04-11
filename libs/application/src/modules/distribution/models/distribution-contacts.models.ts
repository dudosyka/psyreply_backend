import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class DistributionContactsModels extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  user_id: number;

  @Column
  distribution_id: number;
}
