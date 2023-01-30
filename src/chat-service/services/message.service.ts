import { TelegrafContext } from "telegraf-ts";
import { UserService } from "./user.service";
import { BotService } from "./bot.service";
import { BotModel } from "../../modules/bot/models/bot.model";
import { MessageModel } from "../../modules/bot/models/message.model";
import { Sequelize } from "sequelize-typescript";

export class MessageService {
  constructor(private ctx: TelegrafContext, private sequelize: Sequelize) {}

  public async newMessage() {
    const transaction = await this.sequelize.transaction();

    const userService = new UserService(this.ctx.update.message.from, transaction);
    const botService = new BotService(this.ctx.botInfo);
    const botModel: BotModel = await botService.process();
    await userService.process(botModel);

    const content = {
      attachments: [],
      text: this.ctx.message.text
    }

    const messageModel = await MessageModel.create({
      bot_message_id: this.ctx.update.message.message_id,
      type_id: 1,
      content: JSON.stringify(content)
    }, {
      transaction
    });

    await userService.appendMessage(messageModel);

    await transaction.commit()
  }

  public async editMessage() {
    const transaction = await this.sequelize.transaction();

    const content = {
      attachments: [],
      text: this.ctx.update.edited_message.text
    }

    await MessageModel.update({
      content: JSON.stringify(content)
    }, {
      where: {
        bot_message_id: this.ctx.update.edited_message.message_id,
      },
      transaction
    })

    await transaction.commit();
  }
}