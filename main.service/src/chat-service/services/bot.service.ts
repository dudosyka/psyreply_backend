import { User } from "telegraf-ts";
import { BotModel } from "../../modules/bot/models/bot.model";

export class BotService {
  constructor(private bot: User) {}

  async process(): Promise<BotModel> {
    return await BotModel.findOne({
      where: {
        telegram_id: this.bot.id
      }
    })
  }
}