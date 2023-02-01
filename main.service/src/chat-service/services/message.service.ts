import { TelegrafContext } from "telegraf-ts";
import { UserService } from "./user.service";
import { BotService } from "./bot.service";
import { BotModel } from "../../modules/bot/models/bot.model";
import { MessageModel } from "../../modules/bot/models/message.model";
import { Sequelize } from "sequelize-typescript";
import { MessageMediaService } from "./message-media.service";
import { ContentDto, MessageType } from "../dtos/content.dto";
import { UserModel } from "../../modules/user/models/user.model";

export class MessageService {
  constructor(private ctx: TelegrafContext, private sequelize: Sequelize) {}

  public async newMessage(): Promise<void> {
    const transaction = await this.sequelize.transaction();

    const userService = new UserService(this.ctx.update.message.from, transaction);
    const botService = new BotService(this.ctx.botInfo);
    const botModel: BotModel = await botService.process();
    await userService.process(botModel);

    let message_type = 1; //Text is default
    let attachments = [];

    if (this.ctx.updateSubTypes.includes('photo')) {
      message_type = 2; //Photo type
      attachments = await MessageMediaService.process(this.ctx.update.message.photo[this.ctx.update.message.photo.length - 1], this.ctx);
    } else if (this.ctx.updateSubTypes.includes('video')) {
      message_type = 3;
      attachments = await MessageMediaService.process(this.ctx.update.message.video, this.ctx);
    } else if (this.ctx.updateSubTypes.includes('document')) {
      message_type = 4;
      attachments = await MessageMediaService.process(this.ctx.update.message.document, this.ctx);
    }

    const content: ContentDto = {
      attachments,
      text: this.ctx.message.text
    }

    await MessageModel.create({
      bot_message_id: this.ctx.update.message.message_id,
      type_id: message_type,
      content: JSON.stringify(content)
    }, {
      transaction
    }).catch(err => {
      transaction.rollback();
      throw err;
    });
  }

  public async editMessage(): Promise<void> {
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

  public async sendMessage(userModel: UserModel, recipient_id: number, content: ContentDto, messageType: MessageType): Promise<void> {
    const transaction = await this.sequelize.transaction();

    await MessageModel.create({
      bot_message_id: 0,
      type_id: messageType,
      content: JSON.stringify(content)
    }, {
      transaction
    });

    // await UserService.appendMessageStatic(messageModel, userModel.id, transaction, recipient_id);

    await transaction.commit();
  }
}