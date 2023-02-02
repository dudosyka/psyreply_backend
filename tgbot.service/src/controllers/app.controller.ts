import { Controller, Get, Inject } from "@nestjs/common";
import { AppProvider } from '../providers/app.provider';
import { EventPattern } from "@nestjs/microservices";

@Controller()
export class AppController {
  constructor(@Inject(AppProvider) private appProvider: AppProvider) {}

  @Get()
  getHello(): string {
    return "Hello"
  }

  @EventPattern('newMessage')
  newMessage(data: any) {
    this.appProvider.sendMessage(data);
  }
}
