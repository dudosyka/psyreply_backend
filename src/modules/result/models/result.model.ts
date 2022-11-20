import {BelongsTo, Column, Model, PrimaryKey, Table} from "sequelize-typescript";
import {UserModel} from "../../user/models/user.model";
import {BlockModel} from "../../block/models/block.model";
import {DataTypes} from "sequelize";

@Table
export class ResultModel extends Model {
    @PrimaryKey
    @Column
    id: number

    @BelongsTo(() => UserModel, "user_id")
    user: UserModel

    @Column
    data: string

    @BelongsTo(() => BlockModel, "block_id")
    block: BlockModel

    @Column({type: DataTypes.BIGINT})
    timestamp: DataTypes.BigIntDataType
}
