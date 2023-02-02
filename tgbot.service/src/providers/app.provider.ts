import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { BotModel } from "../models/bot.model";
import { Telegraf, TelegrafContext } from "telegraf-ts";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class AppProvider implements OnApplicationBootstrap {
  private botModels = [];
  constructor(
    @Inject('BOT_SERVICE') private botService: ClientProxy,
  ) {
    BotModel.findAll().then(bots => {
      bots.map(bot => {
        const botInstance = new Telegraf(bot.token, {
          telegram: {
            apiRoot: "http://0.0.0.0:8081",
          }
        });
        botInstance.on('message', ctx => this.onMessage(ctx));
        botInstance.on('edited_message', ctx => this.onMessageEdit(ctx));
        console.log(bot.name, "processing...")
        return botInstance.launch().then(() => {
          this.botModels.push({ botInstance, chatId: 828522413 });
          console.log('Bot is launched');
        });
      })
    })
  }

  onMessage(ctx: TelegrafContext) {
    console.log(ctx.update.message.message_id);
    console.log(ctx.chat.id);
    this.botService.emit('newMessage', { ctx: ctx }).subscribe(r => {
      console.log(r);
    });
  }

  sendMessage(data: { msg: string, chatId: string }) {
    this.botModels[0].botInstance.telegram.sendMessage(parseInt(data.chatId), data.msg);
  }

  onMessageEdit(ctx: TelegrafContext) {
    this.botService.emit('editMessage', { ctx: ctx }).subscribe();
  }

  onApplicationBootstrap(): any {
    this.botService.connect().then(res => {
      console.log(res);
    })
  }
}
