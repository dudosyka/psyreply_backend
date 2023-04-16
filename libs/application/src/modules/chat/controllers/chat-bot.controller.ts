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
import { ChatProvider } from '../providers/chat.provider';
import { BotModel } from '../../bot/models/bot.model';
import { ChatGateway } from '../providers/chat.gateway';
import { ChatModel } from '@app/application/modules/chat/models/chat.model';
import { MessageClientOutputDto } from '@app/application/modules/chat/dto/message-client-output.dto';

@Controller('bot')
export class ChatBotController {
  constructor(
    @Inject(ChatProvider) private chatProvider: ChatProvider,
    @Inject(ChatGateway) private chatGateway: ChatGateway,
  ) {}

  @Get('')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(ResponseStatus.SUCCESS)
  public async getBot(@Req() req): Promise<HttpResponseFilter<BotModel[]>> {
    return HttpResponseFilter.response<BotModel[]>(
      await this.chatProvider.getByCompany(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('subs')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getSubscribers(
    @Req() req,
  ): Promise<HttpResponseFilter<ChatModel[]>> {
    return HttpResponseFilter.response<ChatModel[]>(
      await this.chatProvider.getSubscribers(req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':chatId/history')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getHistory(
    @Param('chatId') chatId: number,
  ): Promise<HttpResponseFilter<MessageClientOutputDto[]>> {
    return HttpResponseFilter.response<MessageClientOutputDto[]>(
      await this.chatProvider.getMessages(chatId),
      ResponseStatus.SUCCESS,
    );
  }
}
