import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table
export class BlockModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string
}
