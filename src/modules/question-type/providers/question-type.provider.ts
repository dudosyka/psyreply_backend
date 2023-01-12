import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QuestionTypeModel } from "../models/question-type.model";
import { BaseProvider } from "../../base/base.provider";

@Injectable()
export class QuestionTypeProvider extends BaseProvider<QuestionTypeModel>{
  constructor(
    @InjectModel(QuestionTypeModel) private questionTypeModel: QuestionTypeModel
  ) {
    super(QuestionTypeModel);
  }
}
