import { Controller, Get, Inject, Param, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { BotProvider } from '../providers/bot.provider';
import { AllExceptionFilter } from '../../../filters/all-exception.filter';

@Controller('mservice')
@UseFilters(AllExceptionFilter)
export class BotController {
  constructor(@Inject(BotProvider) private botProvider: BotProvider) {}

  public test?: string = null;

  @EventPattern('newMessage')
  async newMessage(data: {
    ctx_: string;
    message_type: number;
    attachments: string[];
  }) {
    await this.botProvider.newMessageFromTelegram(data).catch((err) => {
      throw err;
    });
  }

  @Get('getChatInfo/:botId/:chatId')
  async getChatInfo(
    @Param('botId') botId: string,
    @Param('chatId') chatId: string,
  ) {
    return this.botProvider.getChatInfo(parseInt(botId), parseInt(chatId));
  }
}
