import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BotModel } from '../models/bot.model';
import { Telegraf, TelegrafContext } from 'telegraf-ts';
import { ClientProxy } from '@nestjs/microservices';
import mainConf from '@app/application/config/main.conf';

@Injectable()
export class TelegramProvider implements OnApplicationBootstrap {
  private botModels = [];
  constructor(@Inject('BOT_SERVICE') private botService: ClientProxy) {
    BotModel.findAll().then((bots) => {
      bots.forEach((bot) => {
        const botInstance = new Telegraf(bot.token, {
          telegram: {
            apiRoot: `http://0.0.0.0:${mainConf().telegramServerPort}`,
          },
        });
        botInstance.on('message', (ctx) => this.onMessage(ctx));
        botInstance.on('edited_message', (ctx) => this.onMessageEdit(ctx));
        botInstance.on('callback_query', (ctx) => this.btnCallback(ctx));
        console.log(bot.name, 'processing...');
        return botInstance.launch().then(() => {
          this.botModels.push({ botInstance, chatId: 828522413 });
          console.log('Bot is launched');
        });
      });
    });
  }

  private processMedia(id: string, ctx: TelegrafContext): Promise<string[]> {
    return ctx.telegram.getFileLink(id).then((url) => [url]);
  }

  async onMessage(ctx: TelegrafContext) {
    console.log(ctx.update.message.message_id);
    console.log(ctx.chat.id);
    await this.botModels[0].botInstance.telegram.sendMessage(828522413, 'hi', {
      reply_markup: {
        inline_keyboard: [
          /* Inline buttons. 2 side-by-side */
          [
            { text: 'Button 1', callback_data: 'btn-1' },
            { text: 'Button 2', callback_data: 'btn-2' },
          ],

          /* One button */
          [{ text: 'Next', callback_data: 'next' }],

          /* Also, we can have URL buttons. */
          [{ text: 'Open in browser', url: 'telegraf.js.org' }],
        ],
      },
    });

    let message_type = 1;
    let attachments = [];

    if (ctx.updateSubTypes.includes('photo')) {
      message_type = 2; //Photo type
      const id =
        ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id;
      attachments = [{ id, link: await this.processMedia(id, ctx) }];
    } else if (ctx.updateSubTypes.includes('video')) {
      message_type = 3;
      const id = ctx.update.message.video.file_id;
      attachments = [{ id, link: await this.processMedia(id, ctx) }];
    } else if (ctx.updateSubTypes.includes('document')) {
      message_type = 4;
      const id = ctx.update.message.document.file_id;
      attachments = [{ id, link: await this.processMedia(id, ctx) }];
    }

    // await this.botModels[0].botInstance.telegram.sendPhoto(828522413, 'AgACAgIAAxkBAAP1Y9w7i18cTM2DbUxxPw9OvEiFeI4AAj3JMRtsM-FK3wABko-2gKaFAQADAgADcwADLQQ')
    // await this.botModels[0].botInstance.telegram.sendVideo(828522413, 'BAACAgIAAxkBAAP6Y9w88qiZ30d25-YQEzZZiIhXcuIAAkMnAAJsM-FKMh6phlQmnK0tBA')
    // await this.botModels[0].botInstance.telegram.sendDocument(828522413, 'BQACAgIAAxkBAAP9Y9w9AAE0OJBwJ790RDGO4aeJriA7AAJEJwACbDPhSoB1FNC-DhCZLQQ')

    // await this.botModels[0].botInstance.telegram.sendPhoto(828522413, 'https://game.psyreply.com/3aE8lz4MtjI.jpg1675383380109.jpg');
    // await this.botModels[0].botInstance.telegram.sendVideo(828522413, { source: fs.createReadStream(path.join(process.cwd(), '../main.service', 'upload', 'video.mp4')) });
    // await this.botModels[0].botInstance.telegram.sendDocument(828522413, { filename: 'video.mp4', source: fs.createReadStream(path.join(process.cwd(), '../main.service', 'upload', 'video.mp4')) });

    this.botService
      .emit('newMessage', { ctx: ctx, message_type, attachments })
      .subscribe((r) => {
        console.log(r);
      });
  }

  btnCallback(ctx: TelegrafContext) {
    console.log(ctx.update.callback_query);
    ctx.reply('ok');
  }

  sendMessage(data: { msg: string; chatId: string }) {
    this.botModels[0].botInstance.telegram.sendMessage(
      parseInt(data.chatId),
      data.msg,
    );
  }

  onMessageEdit(ctx: TelegrafContext) {
    this.botService.emit('editMessage', { ctx: ctx }).subscribe();
  }

  onApplicationBootstrap(): any {
    this.botService.connect().then((res) => {
      console.log(res);
    });
  }
}
