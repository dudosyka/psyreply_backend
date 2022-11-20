import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {TestQuestionModel} from "./models/test.question.model";

@Module({
    imports: [SequelizeModule.forFeature([TestQuestionModel])],
})
export class TestQuestionModule {}
