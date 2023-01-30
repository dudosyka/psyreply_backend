import { Injectable } from "@nestjs/common";
import { UserModel } from "../../user/models/user.model";
import { BaseProvider } from "../../base/base.provider";
import { BotModel } from "../models/bot.model";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { MessageModel } from "../models/message.model";
import { UserMessageModel } from "../models/user-message.model";
import { Op } from "sequelize";
import { BotUserModel } from "../models/bot-user.model";

@Injectable()
export class BotProvider extends BaseProvider<BotModel> {

  constructor() {
    super(BotModel);
  }


  async getSubscribers(botId: number): Promise<UserModel[]> {
    const bot = await this.getOne({
      where: {
        id: botId
      },
      include: [UserModel]
    });

    return bot.subscribers;
  }

  async getByCompany(companyId: number): Promise<BotModel[]> {
    return await this.getAll({
      attributes: [
        "id", "name", "telegram_id", "createdAt", "updatedAt"
      ],
      where: {
        company_id: companyId
      }
    })
  }

  async getByUser(userId: number): Promise<BotModel[]> {
    const userModel = await UserModel.findOne({
      where: {
        id: userId
      }
    });

    if (!userModel)
      throw new ModelNotFoundException(UserModel, userId);

    return await this.getByCompany(userModel.company_id);
  }

  async getMessages(botId: number, userId: number): Promise<UserMessageModel[]> {
    const userModel = await UserModel.findOne({
      where: {
        id: userId
      }
    });

    if (!userModel)
      throw new ModelNotFoundException(UserModel, userId);

    const userBotModel = await BotUserModel.findOne({
      where: {
        bot_id: botId,
        user_id: userId
      }
    });

    if (!userBotModel)
      throw new ModelNotFoundException(BotUserModel, null);

    return await UserMessageModel.findAll({
      where: {
        [Op.or]: [
          {
            recipient_id: userId,
          },
          {
            recipient_id: null,
            user_id: userId
          }
        ]
      },
      include: [ MessageModel ]
    })


  }
}