import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionModel } from './models/question.model';
import { QuestionProvider } from './providers/question.provider';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [SequelizeModule.forFeature([QuestionModel]), LoggerModule],
  providers: [QuestionProvider],
  exports: [QuestionProvider],
})
export class QuestionModule {}
