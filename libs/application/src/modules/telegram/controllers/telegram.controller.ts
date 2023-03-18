import { Controller, Get, Inject } from '@nestjs/common';
import { TelegramProvider } from '../providers/telegram.provider';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class TelegramController {
  constructor(
    @Inject(TelegramProvider) private appProvider: TelegramProvider,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello';
  }

  @EventPattern('newMessage')
  newMessage(data: any) {
    console.log('EVENT LISTENER', data);
    this.appProvider.sendMessage(data);
  }
}
