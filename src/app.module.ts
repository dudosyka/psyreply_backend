import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {default as main} from './confs/main.conf';
import {default as db} from "./confs/db.conf";
import { UserModule } from './modules/user/user.module';
import { TestModule } from './modules/test/test.module';
import { ResultModule } from './modules/result/result.module';
import { QuestionModule } from './modules/question/question.module';
import { MetricModule } from './modules/metric/metric.module';
import { BlockModule } from './modules/block/block.module';
import { BlockController } from './modules/block/controllers/block.controller';
import { ResultController } from './modules/result/controllers/result.controller';
import { QuestionTypeModule } from './modules/question-type/question-type.module';
import { TestQuestionModule } from './modules/test-question/test-question.module';
import { TestBlockModule } from './modules/test-block/test-block.module';
import { CompanyModule } from './modules/company/company.module';
import { CompanyBlockModule } from './modules/company-block/company-block.module';
import { CompanyUserModule } from './modules/company-user/company-user.module';

const db_conf = main.isDev ? db.dev : db.prod;

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: "mysql",
      ...db_conf,
      autoLoadModels: true,
      synchronize: true
    }),
    UserModule,
    TestModule,
    ResultModule,
    QuestionModule,
    MetricModule,
    BlockModule,
    QuestionTypeModule,
    TestQuestionModule,
    TestBlockModule,
    CompanyModule,
    CompanyBlockModule,
    CompanyUserModule,
  ],
  controllers: [AppController, BlockController, ResultController],
  providers: [AppService],
})
export class AppModule {}
