import { Controller, Get, Inject } from '@nestjs/common';
import { TelegramProvider } from '../providers/telegram.provider';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MessageCreateDto } from '@app/application/modules/chat/dto/message-create.dto';
import { TelegramBotInstanceProvider } from '@app/application/modules/telegram/providers/telegram-bot-instance.provider';
import { Chat } from 'telegraf-ts';

@Controller()
export class TelegramController {
  constructor(
    @Inject(TelegramProvider) private telegramProvider: TelegramProvider,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello';
  }

  @EventPattern('newMessage')
  newMessage(data: {
    chatId: number;
    msg: MessageCreateDto;
    botModelId: number;
  }) {
    this.telegramProvider.sendMessage(data);
  }

  @EventPattern('createBot')
  async createBot(data: { botModelId: number }) {
    await TelegramBotInstanceProvider.pushById(data.botModelId);
  }

  @MessagePattern('getChat')
  async getChatInfo({ chatId, botId }): Promise<Chat> {
    return await this.telegramProvider.getChat(chatId, botId);
  }
}
