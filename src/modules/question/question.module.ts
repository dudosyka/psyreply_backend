import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {QuestionModel} from "./models/question.model";

@Module({
    imports: [SequelizeModule.forFeature([QuestionModel])],
})
export class QuestionModule {}
