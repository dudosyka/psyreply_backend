import { AutoIncrement, BelongsToMany, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { BlockModel } from "../../block/models/block.model";

@Table
export class CompanyModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    name: string

    @BelongsToMany(() => BlockModel, () => BlockModel, "company_id", "id")
    blocks: BlockModel[]
}
