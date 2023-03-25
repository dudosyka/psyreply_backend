import { Injectable } from '@nestjs/common';
import { BotModel } from '@app/application/modules/telegram/models/bot.model';
import { Telegraf, TelegrafContext } from 'telegraf-ts';
import { TelegramBotInstanceDto } from '@app/application/modules/telegram/dto/telegram-bot-instance.dto';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { FailedBotLoadingException } from '@app/application/exceptions/telegram/failed-bot-loading.exception';

@Injectable()
export class TelegramBotInstanceProvider {
  static instances: TelegramBotInstanceDto[] = [];

  public static async init(
    onMessage: CallableFunction,
    onMessageEdit: CallableFunction,
    btnCallback: CallableFunction,
  ) {
    this.onMessage = onMessage;
    this.onMessageEdit = onMessageEdit;
    this.btnCallback = btnCallback;
    const models = await BotModel.findAll();
    TelegramBotInstanceProvider.load(models);
  }

  public all(): TelegramBotInstanceDto[] {
    return TelegramBotInstanceProvider.instances;
  }

  static onMessage: CallableFunction = (ctx) => console.log(ctx);

  static onMessageEdit: CallableFunction = (ctx) => console.log(ctx);

  static btnCallback: CallableFunction = (ctx) => console.log(ctx);

  private static loadInstance(bot: BotModel) {
    let botInstance: Telegraf<TelegrafContext>;
    try {
      botInstance = new Telegraf(bot.token);
      botInstance.catch((err) => {
        console.log('CATCHED!', err);
      });

      botInstance.on('message', (ctx) => this.onMessage(ctx));
      botInstance.on('edited_message', (ctx) => this.onMessageEdit(ctx));
      botInstance.on('callback_query', (ctx) => this.btnCallback(ctx));
      console.log(bot.name, 'processing...');
      botInstance
        .launch()
        .then(() => {
          TelegramBotInstanceProvider.instances.push({
            model: bot,
            bot: botInstance,
          });
          console.log(bot.name, 'is launched');
        })
        .catch(() => {
          throw new FailedBotLoadingException(bot.token, bot.id);
        });
    } catch (err) {
      console.log('Error is here');
      throw new FailedBotLoadingException(bot.token, bot.id);
    }
  }

  public static load(models: BotModel[]) {
    models.forEach((bot) => {
      TelegramBotInstanceProvider.loadInstance(bot);
    });
  }

  private static findInstance(model: BotModel) {
    const filtered = TelegramBotInstanceProvider.instances.find((el) => {
      return el.model.id == model.id;
    });
    if (filtered) return filtered[0];
    else return null;
  }

  public static push(model: BotModel) {
    const checkExists = TelegramBotInstanceProvider.findInstance(model);
    if (checkExists) return;
    TelegramBotInstanceProvider.loadInstance(model);
  }

  public static async pushById(botModelId: number) {
    const model = await BotModel.findOne({
      where: {
        id: botModelId,
      },
    });

    if (!model) throw new ModelNotFoundException(BotModel, botModelId);

    TelegramBotInstanceProvider.push(model);
  }

  public static async remove(model: BotModel) {
    const index = TelegramBotInstanceProvider.instances.findIndex((el) => {
      return el.model.id == model.id;
    });

    if (index !== -1) {
      await TelegramBotInstanceProvider.instances[index].bot.stop();
      TelegramBotInstanceProvider.instances.splice(index, 1);
    }
  }
}
