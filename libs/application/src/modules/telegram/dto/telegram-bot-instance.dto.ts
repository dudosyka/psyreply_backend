import { Telegraf, TelegrafContext } from 'telegraf-ts';
import { BotModel } from '@app/application/modules/telegram/models/bot.model';

export class TelegramBotInstanceDto {
  bot: Telegraf<TelegrafContext>;

  model: BotModel;
}
