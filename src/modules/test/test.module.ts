import { Module } from '@nestjs/common';
import { TestController } from './controllers/test.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {TestModel} from "./models/test.model";

@Module({
  imports: [SequelizeModule.forFeature([TestModel])],
  controllers: [TestController]
})
export class TestModule {}
