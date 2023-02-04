import { Controller, Inject, UseFilters } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { BotProvider } from '../providers/bot.provider';
import { TelegrafContext } from 'telegraf-ts';
import { AllExceptionFilter } from '../../../filters/all-exception.filter';

@Controller('mservice')
@UseFilters(AllExceptionFilter)
export class BotController {
  constructor(@Inject(BotProvider) private botProvider: BotProvider) {}

  @EventPattern('newMessage')
  async newMessage(data: {
    ctx: TelegrafContext;
    message_type: number;
    attachments: string[];
  }) {
    await this.botProvider.newMessage(data).catch((err) => {
      throw err;
    });
  }
}
