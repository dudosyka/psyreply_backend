import { Injectable, UseFilters } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QuestionModel } from "../models/question.model";
import { Transaction } from "sequelize";
import { QuestionDto } from "../dtos/question.dto";
import { TestModel } from "../../test/models/test.model";
import { GlobalExceptionFilter } from "../../../filters/global.exception.filter";

@Injectable()
@UseFilters(GlobalExceptionFilter)
export class QuestionProvider {
  constructor(
    @InjectModel(QuestionModel) private questionModel: QuestionModel
  ) {
  }

  async add(questions: QuestionDto[], testModel: TestModel, host: { transaction: Transaction }): Promise<boolean> {
    const records = [];
    questions.map(el => {
      records.push({
        test_id: testModel.id,
        title: el.title,
        picture: el.picture,
        coins: el.coins,
        type_id: testModel.type_id,
        value: JSON.stringify(el.answers)
      })
    })
    await QuestionModel.bulkCreate(records, host);
    return true;
  }

  async removeByTest(testId: number): Promise<void> {
    await QuestionModel.destroy({
      where: {
        test_id: testId
      }
    })
  }
}
