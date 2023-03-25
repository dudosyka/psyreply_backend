import { Module } from '@nestjs/common';
import mainConf from '../../../../../apps/tgbot/src/confs/main.conf';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModel } from './models/bot.model';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { TelegramController } from './controllers/telegram.controller';
import { TelegramProvider } from './providers/telegram.provider';
import { FilesModule } from '@app/application/modules/files/files.module';
import { FilesProvider } from '@app/application/modules/files/providers/files.provider';
import { TelegramBotInstanceProvider } from '@app/application/modules/telegram/providers/telegram-bot-instance.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([BotModel]),
    ClientsModule.register([]),
    FilesModule,
  ],
  controllers: [TelegramController],
  providers: [
    {
      provide: 'BOT_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: mainConf().microservicePort,
          },
        });
      },
    },
    TelegramBotInstanceProvider,
    FilesProvider,
    TelegramProvider,
  ],
  exports: [
    {
      provide: 'BOT_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            port: mainConf().microservicePort,
          },
        });
      },
    },
    SequelizeModule.forFeature([BotModel]),
    TelegramProvider,
    FilesModule,
  ],
})
export class TelegramModule {}
