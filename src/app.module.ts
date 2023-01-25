import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SequelizeModule } from "@nestjs/sequelize";
import mainConf, { ProjectState } from "./confs/main.conf";
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

let db_conf: any = mainConf.db.dev;
if (mainConf.isDev == ProjectState.TEST_PROD)
  db_conf = mainConf.db.test_prod;
else if (mainConf.isDev == ProjectState.PROD)
  db_conf = mainConf.db.prod;

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      ...db_conf,
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
