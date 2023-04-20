import { Inject, Injectable } from '@nestjs/common';
import { CompanyProvider } from '../../company/providers/company.provider';
import { UserModel } from '../models/user.model';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { Op } from 'sequelize';
import { BaseProvider } from '../../base/base.provider';
import { BotModel } from '../../bot/models/bot.model';
import { MessageModel } from '../../bot/models/message.model';
import { User } from 'telegraf-ts';
import { Sequelize } from 'sequelize-typescript';
import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import { UrlGeneratorUtil } from '@app/application/utils/url-generator.util';
import { AuthCreateUserDto } from '@app/application/modules/user/dtos/auth/auth-create-user.dto';
import { GroupModel } from '@app/application/modules/company/models/group.model';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { ChatBotModel } from '@app/application/modules/bot/models/chat-bot.model';
import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';
import { ChatDirection } from '@app/application/modules/chat/dto/chat-direction.enum';

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

    // await UserGroupModel.findAll({
    //   include: [
    //     {
    //       model: UserModel,
    //       required: true,
    //       where: {
    //         ...filter,
    //       },
    //       include: [
    //         {
    //           model: GroupModel,
    //           required: true,
    //           where: {
    //             ...(filter.group_id ? { id: filter.group_id } : {}),
    //             ...(except_group_id
    //               ? {
    //                   id: {
    //                     [Op.or]: [
    //                       { [Op.not]: except_group_id },
    //                       { [Op.is]: null },
    //                     ],
    //                   },
    //                 }
    //               : {}),
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // });

    const where = {
      ...(filter.group_id ? { id: filter.group_id } : {}),
      ...(except_group_id
        ? {
            id: {
              [Op.or]: [{ [Op.not]: except_group_id }, { [Op.is]: null }],
            },
          }
        : {}),
    };

    if (Object.keys(where).length)
      return await UserModel.findAll({
        where: {
          ...filter,
        },
        include: [
          {
            model: GroupModel,
            required: false,
            where,
          },
        ],
      });
    else
      return await UserModel.findAll({
        where: {
          ...filter,
        },
        include: [GroupModel],
      });
  }

  async genChat(
    botModel: BotModel,
    user: User,
    chatId: number,
  ): Promise<ChatBotModel> {
    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    let chatBotModel = await ChatBotModel.findOne({
      where: {
        telegram_chat_id: chatId,
      },
      include: [ChatModel],
    });

    if (!chatBotModel) {
      const model = await UserModel.create(
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

      const chatModel = await ChatModel.create(
        {
          user_id: model.id,
          company_id: botModel.company_id,
        },
        TransactionUtil.getHost(),
      )
        .then((res) => {
          if (!res) {
            if (!isPropagate) TransactionUtil.rollback();
            throw new Error('Chat creation failed');
          }
          return res;
        })
        .catch((err) => {
          TransactionUtil.rollback();
          throw err;
        });

      chatBotModel = await ChatBotModel.create(
        {
          chat_id: chatModel.id,
          user_id: model.id,
          username: user.username,
          bot_id: botModel.id,
          telegram_chat_id: chatId,
        },
        TransactionUtil.getHost(),
      )
        .then((res) => {
          if (!res) {
            if (!isPropagate) TransactionUtil.rollback();
            throw new Error('Chat creation failed');
          }
          return res;
        })
        .catch((err) => {
          TransactionUtil.rollback();
          throw err;
        });
    }

    if (!isPropagate) await TransactionUtil.commit();

    return chatBotModel;
  }

  async appendMessage(
    messageModel: MessageModel,
    chat_id: number,
    isAdmin: number | null = null,
  ): Promise<ChatMessageModel> {
    if (!TransactionUtil.isSet()) {
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const onCreate: any = {
      chat_id,
      message_id: messageModel.id,
      direction: ChatDirection.USER_TO_COMPANY,
    };
    if (isAdmin) onCreate.direction = ChatDirection.COMPANY_TO_USER;

    return await ChatMessageModel.create(onCreate, TransactionUtil.getHost())
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('ChatMessage creation failed');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });
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
