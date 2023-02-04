import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionTypeModel } from './models/question-type.model';
import { QuestionTypeProvider } from './providers/question-type.provider';
import { QuestionTypeController } from './controllers/question-type.controller';

@Module({
  imports: [SequelizeModule.forFeature([QuestionTypeModel])],
  providers: [QuestionTypeProvider],
  controllers: [QuestionTypeController],
})
export class QuestionTypeModule {}
