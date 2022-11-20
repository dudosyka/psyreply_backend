import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {QuestionTypeModel} from "./models/question-type.model";

@Module({
    imports: [SequelizeModule.forFeature([QuestionTypeModel])],
})
export class QuestionTypeModule {}
