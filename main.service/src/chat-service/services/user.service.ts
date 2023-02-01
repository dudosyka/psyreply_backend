import { UserModel } from "../../modules/user/models/user.model";
import { User } from "telegraf-ts";
import { BotModel } from "../../modules/bot/models/bot.model";
import { BotUserModel } from "../../modules/bot/models/bot-user.model";
import { Transaction } from "sequelize";

export class UserService {
  private userModel: UserModel;
  constructor(private user: User, private transaction: Transaction) {}

  async process(botModel: BotModel): Promise<UserModel> {
    const model = await UserModel.findOne({
      where: {
        jetBotId: this.user.id
      }
    });

    if (!model) {
      this.userModel = await UserModel.create({
        jetBotId: this.user.id,
        login: this.user.username,
        hash: "",
        isAdmin: 0,
        coins: 0,
        company_id: botModel.company_id
      }, {
        transaction: this.transaction
      })
      await BotUserModel.create({
        user_id: this.userModel.id,
        bot_id: botModel.id
      }, {
        transaction: this.transaction
      })
      return this.userModel;
    }

    this.userModel = model;

    return this.userModel;
  }

}