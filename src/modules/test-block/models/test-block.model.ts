import { AutoIncrement, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import {TestModel} from "../../test/models/test.model";
import {BlockModel} from "../../block/models/block.model";
import {DataTypes} from "sequelize";

@Table
export class TestBlockModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number

    @BelongsTo(() => TestModel, "test_id")
    test: TestModel

    @BelongsTo(() => BlockModel, "block_id")
    block: BlockModel
}
