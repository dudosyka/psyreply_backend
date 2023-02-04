import { Module } from '@nestjs/common';
import mainConf from '../../../../../apps/tgbot/src/confs/main.conf';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModel } from './models/bot.model';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TelegramController } from './controllers/telegram.controller';
import { TelegramProvider } from './providers/telegram.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([BotModel]),
    ClientsModule.register([
      {
        name: 'BOT_SERVICE',
        transport: Transport.TCP,
        options: {
          port: mainConf().microservicePort,
        },
      },
    ]),
  ],
  controllers: [TelegramController],
  providers: [TelegramProvider],
  exports: [TelegramProvider],
})
export class TelegramModule {}
