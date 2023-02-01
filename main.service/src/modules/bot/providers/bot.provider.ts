import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { TelegrafContext } from "telegraf-ts";
import { ChatGateway } from "../../chat/providers/chat.gateway";
import { BotModel } from "../models/bot.model";
import { MessageMediaService } from "../../../chat-service/services/message-media.service";
import { ContentDto } from "../../../chat-service/dtos/content.dto";
import { MessageModel } from "../models/message.model";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { Sequelize } from "sequelize-typescript";
import { UserProvider } from "../../user/providers/user.provider";

@Injectable()
export class BotProvider {
  constructor(
    @Inject('SERVICE') private botService: ClientProxy,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    private sequelize: Sequelize,
    @Inject(UserProvider) private userProvider: UserProvider
  ) {
  }

  //Get a message from microservice (tg bot) than emit it to socket
  async newMessage(
    data: { ctx: TelegrafContext }
  ) {
    if (!TransactionUtil.isSet())
      TransactionUtil.setHost(await this.sequelize.transaction())

    const botModel = await BotModel.findOne({
      where: {
        telegram_id: data.ctx.botInfo.id
      }
    })

    const userModel = await this.userProvider.genChat(botModel, data.ctx.update.message.from, data.ctx.update.message.chat.id).catch(err => {
      TransactionUtil.rollback();
      throw err;
    });

    let message_type = 1; //Text is default
    let attachments = [];

    if (data.ctx.updateSubTypes.includes('photo')) {
      message_type = 2; //Photo type
      attachments = await MessageMediaService.process(data.ctx.update.message.photo[data.ctx.update.message.photo.length - 1], data.ctx);
    } else if (data.ctx.updateSubTypes.includes('video')) {
      message_type = 3;
      attachments = await MessageMediaService.process(data.ctx.update.message.video, data.ctx);
    } else if (data.ctx.updateSubTypes.includes('document')) {
      message_type = 4;
      attachments = await MessageMediaService.process(data.ctx.update.message.document, data.ctx);
    }

    const content: ContentDto = {
      attachments,
      text: data.ctx.update.message.text
    }

    const messageModel = await MessageModel.create({
      bot_message_id: data.ctx.update.message.message_id,
      type_id: message_type,
      content: JSON.stringify(content)
    }, TransactionUtil.getHost()).catch(err => {
      TransactionUtil.rollback();
      throw err;
    });

    await this.userProvider.appendMessage(messageModel, userModel.id).catch(err => {
      TransactionUtil.rollback();
      throw err;
    });

    await TransactionUtil.commit()

    this.chatGateway.server.to(data.ctx.update.message.chat.id.toString()).emit('newMessage', { text: data.ctx.update.message.text })
  }

  //Get a message from socket than emit it to microservice (tg bot)
  emitNewMessage(chatId: number, msg: string) {
    this.botService.emit('newMessage', { chatId, msg })
  }

  // @EventPattern('editMessage')
  // editMessage(
  //   data: { ctx: TelegrafContext }
  // ) {
  //
  // }

}