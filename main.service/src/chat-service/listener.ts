import { Telegraf, TelegrafContext } from 'telegraf-ts'
import { MessageService } from "./services/message.service";
import { Sequelize } from "sequelize-typescript";

export class TelegramListener {
  private bot: Telegraf<any>
  constructor(token: string, private sequelize: Sequelize) {
    this.bot = new Telegraf(token, {
      telegram: {
        apiRoot: "http://0.0.0.0:8081",
      }
    });
    this.bot.on('message', ctx => this.onMessage(ctx));
    this.bot.on('edited_message', ctx => this.onMessageEdit(ctx));
  }

  onMessage(ctx: TelegrafContext) {
    console.log(ctx);
    const messageService = new MessageService(ctx, this.sequelize);
    messageService.newMessage();
  }

  onMessageEdit(ctx: TelegrafContext) {
    const messageService = new MessageService(ctx, this.sequelize);
    messageService.editMessage();
  }

  launch(): Promise<void> {
    return this.bot.launch().then(() => {
      console.log('Bot is launched');
    });
  }
}