import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { BotModel } from '../models/bot.model';
import { MessageModel } from '../models/message.model';
import { TransactionUtil } from '../../../utils/TransactionUtil';
import { Sequelize } from 'sequelize-typescript';
import { UserProvider } from '../../user/providers/user.provider';
import { BotMessageProvider } from '@app/application/modules/bot/providers/bot-message.provider';
import { TelegramNewMessageDto } from '@app/application/modules/telegram/dto/telegram-new-message.dto';
import { ClientNewMessageDto } from '@app/application/modules/chat/dto/client-new-message.dto';
import { BotCreateDto } from '@app/application/modules/bot/dto/bot-create.dto';
import { WsResponseFilter } from '@app/application/filters/ws-response.filter';
import { ResponseStatus } from '@app/application/filters/http-response.filter';

type ContentDto = {
  attachments: string[];
  text: string;
};

@Injectable()
export class BotProvider {
  constructor(
    @Inject('SERVICE') private botService: ClientProxy,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    private sequelize: Sequelize,
    @Inject(UserProvider) private userProvider: UserProvider,
    @Inject(BotMessageProvider) private botMessageProvider: BotMessageProvider,
  ) {}

  //Get a message from microservice (tg bot) than emit it to socket
  async newMessageFromTelegram(data: {
    ctx_: string;
    message_type: number;
    attachments: string[];
  }) {
    if (!TransactionUtil.isSet())
      TransactionUtil.setHost(await this.sequelize.transaction());

    const ctx: TelegramNewMessageDto = JSON.parse(data.ctx_);

    console.log(ctx);

    const botModel = await BotModel.findOne({
      where: {
        telegram_id: ctx.botInfo.id,
      },
    });

    const userModel = await this.userProvider
      .genChat(botModel, ctx.message.from, ctx.message.chat.id)
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    const message_type = data.message_type; //Text is default
    const attachments = data.attachments;

    const content: ContentDto = {
      attachments,
      text: ctx.message.text,
    };

    console.log(content);

    const messageModel = await MessageModel.create(
      {
        bot_message_id: ctx.message.message_id,
        type_id: message_type,
        content: content,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('Message creation failed');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    await this.userProvider
      .appendMessage(messageModel, userModel.id)
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    await TransactionUtil.commit();

    this.chatGateway.server
      .to(ctx.message.chat.id.toString())
      .emit(
        'newMessage',
        WsResponseFilter.responseObject<MessageModel>(
          messageModel,
          ResponseStatus.SUCCESS,
        ),
      );
  }

  //Get a message from socket than emit it to microservice (tg bot)
  async newMessageFromClient(
    newMessageDto: ClientNewMessageDto,
    userId: number,
  ): Promise<MessageModel> {
    if (!TransactionUtil.isSet())
      TransactionUtil.setHost(await this.sequelize.transaction());

    const { msg, botModelId } =
      await this.botMessageProvider.saveMessageFromClient(
        userId,
        newMessageDto.msg,
        newMessageDto.botUserId,
      );

    this.botService
      .emit('newMessage', {
        chatId: newMessageDto.chatId,
        msg: newMessageDto.msg,
        botModelId,
      })
      .subscribe({
        next: null,
        error: (error) => {
          console.log(error);
        },
      });

    return msg;
  }

  async getAllByCompany(companyId: number) {
    return BotModel.findAll({
      attributes: ['id', 'name', 'telegram_id', 'createdAt', 'updatedAt'],
      where: {
        company_id: companyId,
      },
    });
  }

  async create(createDto: BotCreateDto): Promise<BotModel> {
    const bot = await BotModel.create({
      ...createDto,
    });

    console.log('Bot created!');

    this.botService.emit('createBot', {
      botModelId: bot.id,
    });
    return bot;
  }
}
