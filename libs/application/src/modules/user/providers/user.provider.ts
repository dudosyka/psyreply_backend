import { Inject, Injectable } from '@nestjs/common';
import { CompanyProvider } from '../../company/providers/company.provider';
import { UserModel } from '../models/user.model';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { Op } from 'sequelize';
import { BaseProvider } from '../../base/base.provider';
import { BotModel } from '../../bot/models/bot.model';
import { BotUserModel } from '../../bot/models/bot-user.model';
import { MessageModel } from '../../bot/models/message.model';
import { User } from 'telegraf-ts';
import { Sequelize } from 'sequelize-typescript';
import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { UserMessageModel } from '../../bot/models/user-message.model';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { UrlGeneratorUtil } from '@app/application/utils/url-generator.util';
import { AuthCreateUserDto } from '@app/application/modules/user/dtos/auth/auth-create-user.dto';
import { GroupModel } from '@app/application/modules/company/models/group.model';
import { UserGroupModel } from '@app/application/modules/company/models/user-group.model';

@Injectable()
export class UserProvider extends BaseProvider<UserModel> {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
    @Inject(AuthProvider) private authProvider: AuthProvider,
    private sequelize: Sequelize,
  ) {
    super(UserModel);
  }

  public async moveToCompany(
    userId: number,
    companyId: number,
  ): Promise<boolean> {
    return await this.companyProvider.appendUser(userId, companyId);
  }

  public async getAll(
    { filters }: UserFilterDto,
    companyId: number = null,
  ): Promise<UserModel[]> {
    const { byCompany, except_group_id, ...filter } = filters;

    if (byCompany) filter.company_id = companyId;

    if (except_group_id || filter.group_id) {
      return (
        await UserGroupModel.findAll({
          include: [
            {
              model: UserModel,
              required: true,
              where: {
                ...filter,
              },
              include: [
                {
                  model: GroupModel,
                  required: true,
                  where: {
                    ...(filter.group_id ? { id: filter.group_id } : {}),
                    ...(except_group_id
                      ? {
                          id: {
                            [Op.or]: [
                              { [Op.not]: except_group_id },
                              { [Op.is]: null },
                            ],
                          },
                        }
                      : {}),
                  },
                },
              ],
            },
          ],
        })
      ).map((el) => el.user);
    } else {
      return super.getAll({
        ...filter,
      });
    }
  }

  async genChat(
    botModel: BotModel,
    user: User,
    chatId: number,
  ): Promise<UserModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    let model = await UserModel.findOne({
      where: {
        jetBotId: user.id,
      },
    });

    if (!model) {
      model = await UserModel.create(
        {
          jetBotId: user.id,
          login: user.username,
          hash: '',
          avatar: 5,
          isAdmin: 0,
          coins: 0,
          company_id: botModel.company_id,
        },
        TransactionUtil.getHost(),
      ).then((res) => {
        if (!res) {
          if (!isPropagate) TransactionUtil.rollback();
          throw new Error('User creation failed');
        }
        return res;
      });
    }

    const botUserModel = await BotUserModel.findOne({
      where: {
        user_id: model.id,
        bot_id: botModel.id,
      },
    });

    if (!botUserModel) {
      await BotUserModel.create(
        {
          user_id: model.id,
          username: user.username,
          bot_id: botModel.id,
          chat_id: chatId,
        },
        TransactionUtil.getHost(),
      ).catch((err) => {
        if (!isPropagate) TransactionUtil.rollback();
        console.log(err);
        throw err;
      });
    }

    if (!isPropagate) await TransactionUtil.commit();

    return model;
  }

  async appendMessage(
    messageModel: MessageModel,
    user_id: number,
    isAdmin: number | null = null,
  ) {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const onCreate: any = {
      user_id,
      bot_id: messageModel.bot_id,
      message_id: messageModel.id,
    };
    if (isAdmin) onCreate.recipient_id = isAdmin;

    await UserMessageModel.create(onCreate, TransactionUtil.getHost()).catch(
      (err) => {
        if (!isPropagate) TransactionUtil.rollback();
        throw err;
      },
    );
  }

  async getProfileLink(userId: number): Promise<string> {
    const clientUrl = UrlGeneratorUtil.generateClientEndpoint();

    return `${clientUrl}results/${await this.authProvider.assignUser(userId)}`;
  }

  async createOne(userDto: AuthCreateUserDto) {
    return await UserModel.create({
      ...userDto,
    });
  }
}
