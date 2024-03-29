import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CompanyModel } from '../../company/models/company.model';
import { GroupModel } from '../../company/models/group.model';
import { BaseModel } from '../../base/base.provider';
import { FilesModel } from '@app/application/modules/files/models/files.model';
import { UserGroupModel } from '@app/application/modules/company/models/user-group.model';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';

@Table
export class UserModel extends BaseModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({
    type: DataType.BIGINT,
  })
  jetBotId: number;

  @Column
  fullname: string;

  @Column
  login: string;

  @Column
  avatar: number;

  @BelongsTo(() => FilesModel, 'avatar')
  img: FilesModel;

  @Column
  hash: string;

  @Column
  emailCode: string;

  @Column
  email: string;

  @Column
  phone: string;

  @Column
  isAdmin: boolean;

  @Column
  coins: number;

  @Column
  @ForeignKey(() => CompanyModel)
  company_id: number;

  @BelongsTo(() => CompanyModel, 'company_id')
  company: CompanyModel;

  // @BelongsTo(() => GroupModel, 'group_id')
  group: GroupModel;

  @BelongsToMany(() => GroupModel, () => UserGroupModel, 'user_id', 'group_id')
  groups: GroupModel[];

  @HasOne(() => ChatModel)
  chatModel: ChatModel;
}
