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

@Injectable()
export class UserProvider extends BaseProvider<UserModel> {
  constructor(
    @Inject(CompanyProvider) private companyProvider: CompanyProvider,
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
    let where: any = {
      ...filter,
    };
    if (filters.except_group_id) {
      where = {
        group_id: {
          [Op.or]: [{ [Op.not]: filters.except_group_id }, { [Op.is]: null }],
        },
        ...filter,
      };
    }

    if (filters.byCompany) {
      where['company_id'] = companyId;
    }

    return super.getAll({
      where,
    });
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

    const model = await UserModel.findOne({
      where: {
        jetBotId: user.id,
      },
    });

    if (!model) {
      const newUser = await UserModel.create(
        {
          jetBotId: user.id,
          login: user.username,
          hash: '',
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

      await BotUserModel.create(
        {
          user_id: newUser.id,
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

      if (!isPropagate) await TransactionUtil.commit();
    }

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
}
