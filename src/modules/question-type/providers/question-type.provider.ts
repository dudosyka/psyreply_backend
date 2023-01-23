import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QuestionTypeModel } from '../models/question-type.model';

@Injectable()
export class QuestionTypeProvider {
  constructor(
    @InjectModel(QuestionTypeModel)
    private questionTypeModel: QuestionTypeModel,
  ) {}

  public getAll(): Promise<QuestionTypeModel[]> {
    return QuestionTypeModel.findAll();
  }
}
