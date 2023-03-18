import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AdminGuard } from '../../../guards/admin.guard';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { UserModel } from '../../user/models/user.model';
import { ChatProvider } from '../providers/chat.provider';
import { BotModel } from '../../bot/models/bot.model';
import { UserMessageModel } from '../../bot/models/user-message.model';
import { ChatGateway } from '../providers/chat.gateway';

@Controller('bot')
export class ChatBotController {
  constructor(
    @Inject(ChatProvider) private chatProvider: ChatProvider,
    @Inject(ChatGateway) private chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getBot(
    @Param('companyId') companyId: number,
  ): Promise<HttpResponseFilter<BotModel[]>> {
    return HttpResponseFilter.response<BotModel[]>(
      await this.chatProvider.getByCompany(companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getByToken(@Req() req): Promise<HttpResponseFilter<BotModel[]>> {
    return HttpResponseFilter.response<BotModel[]>(
      await this.chatProvider.getByUser(req.user.id),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':botId/subs')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getSubscribers(
    @Param('botId') botId: number,
  ): Promise<HttpResponseFilter<UserModel[]>> {
    return HttpResponseFilter.response<UserModel[]>(
      await this.chatProvider.getSubscribers(botId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':botId/chat/:userId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getHistory(
    @Param('userId') userId: number,
    @Param('botId') botId: number,
  ): Promise<HttpResponseFilter<UserMessageModel[]>> {
    return HttpResponseFilter.response<UserMessageModel[]>(
      await this.chatProvider.getMessages(botId, userId),
      ResponseStatus.SUCCESS,
    );
  }

  // @Get('/send/:botId/:msg')
  // public async sendMessage(
  //   @Param('botId') botId: number,
  //   @Param('msg') msg: string
  // ) {
  //   const bot = await BotModel.findOne({ where: { id: botId } });
  //   this.service.emit('newMessage', { msg });
  // }
  //
  // @EventPattern('newMessage')
  // public async tgBotNewMessage(data: any) {
  //   this.chatGateway.server.to(`chat58`).emit('msg', data.data);
  //   // console.log(data.data);
  // }
}
