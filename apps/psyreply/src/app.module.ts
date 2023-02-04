import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import mainConf from '@app/application/config/main.conf';
import { UserModule } from '@app/application/modules/user/user.module';
import { TestModule } from '@app/application/modules/test/test.module';
import { ResultModule } from '@app/application/modules/result/result.module';
import { QuestionModule } from '@app/application/modules/question/question.module';
import { MetricModule } from '@app/application/modules/metric/metric.module';
import { BlockModule } from '@app/application/modules/block/block.module';
import { QuestionTypeModule } from '@app/application/modules/question-type/question-type.module';
import { TestBlockModule } from '@app/application/modules/test-block/test-block.module';
import { CompanyModule } from '@app/application/modules/company/company.module';
import { LoggerModule } from '@app/application/modules/logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@app/application/filters/global-exception.filter';
import { HttpExceptionFilter } from '@app/application/filters/http-exception.filter';
import { DatabaseErrorFilter } from '@app/application/filters/database-error.filter';
import { BcryptUtil } from '@app/application/utils/bcrypt.util';
import { GameModule } from '@app/application/modules/game/game.module';
import { ValidationExceptionFilter } from '@app/application/filters/validation-exception.filter';
import { ChatModule } from '@app/application/modules/chat/chat.module';
import { BotModule } from '@app/application/modules/bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import mailerConf from '@app/application/config/mailer.conf';
import dbConf from '@app/application/config/db.conf';
import { FilesModule } from '@app/application/modules/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env', '.env', '/root/api.beta/.env'],
      load: [mailerConf, dbConf, mainConf],
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      ...dbConf(),
      autoLoadModels: true,
      synchronize: true,
    }),
    UserModule,
    TestModule,
    ResultModule,
    QuestionModule,
    MetricModule,
    BlockModule,
    QuestionTypeModule,
    TestBlockModule,
    CompanyModule,
    LoggerModule,
    GameModule,
    ChatModule,
    BotModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    BcryptUtil,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseErrorFilter,
    },
  ],
})
export class AppModule {}
