import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SequelizeModule } from "@nestjs/sequelize";
import mainConf from "./confs/main.conf";
import { UserModule } from "./modules/user/user.module";
import { TestModule } from "./modules/test/test.module";
import { ResultModule } from "./modules/result/result.module";
import { QuestionModule } from "./modules/question/question.module";
import { MetricModule } from "./modules/metric/metric.module";
import { BlockModule } from "./modules/block/block.module";
import { QuestionTypeModule } from "./modules/question-type/question-type.module";
import { TestBlockModule } from "./modules/test-block/test-block.module";
import { CompanyModule } from "./modules/company/company.module";
import { LoggerModule } from "./modules/logger/logger.module";
import { APP_FILTER } from "@nestjs/core";
import { GlobalExceptionFilter } from "./filters/global-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { DatabaseErrorFilter } from "./filters/database-error.filter";
import { BcryptUtil } from "./utils/bcrypt.util";
import { GameModule } from "./modules/game/game.module";
import { ValidationExceptionFilter } from "./filters/validation-exception.filter";
import { ChatModule } from "./modules/chat/chat.module";
import { BotModule } from "./modules/bot/bot.module";
import { ConfigModule } from "@nestjs/config";
import mailerConf from "./confs/mailer.conf";
import dbConf from "./confs/db.conf";
import { FilesModule } from "./modules/files/files.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../.env'],
      load: [mailerConf, dbConf, mainConf],
      isGlobal: true
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
    FilesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
