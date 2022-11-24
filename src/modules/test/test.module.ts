import { Module } from '@nestjs/common';
import { TestController } from './controllers/test.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {TestModel} from "./models/test.model";
import { TestProvider } from "./providers/test.provider";
import { QuestionModule } from "../question/question.module";
import { BlockModule } from "../block/block.module";

@Module({
  imports: [SequelizeModule.forFeature([TestModel]), QuestionModule, BlockModule],
  providers: [TestProvider],
  controllers: [TestController]
})
export class TestModule {}
