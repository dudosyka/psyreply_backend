import { Module } from '@nestjs/common';
import { TelegramModule } from '@app/application/modules/telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import dbConf from './confs/db.conf';
import mainConf from './confs/main.conf';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModel } from '@app/application/modules/telegram/models/bot.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      load: [dbConf, mainConf],
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...dbConf(),
      dialect: 'mysql',
      autoLoadModels: true,
      synchronize: true,
      models: [BotModel],
    }),
    TelegramModule,
  ],
})
export class AppModule {}
