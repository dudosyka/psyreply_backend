import {Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table
export class UserModel extends Model {
    @PrimaryKey
    @Column
    id: number;

    @Column
    jetBotId: number

    @Column
    login: string;

    @Column
    hash: string

    @Column
    emailCode: string

    @Column
    email: string

    @Column
    isAdmin: boolean

    @Column
    coins: number
}
