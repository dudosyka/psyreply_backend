import { Injectable, UseFilters } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QuestionModel } from "../models/question.model";
import { QuestionDto } from "../dtos/question.dto";
import { TestModel } from "../../test/models/test.model";
import { GlobalExceptionFilter } from "../../../filters/global-exception.filter";
import { TransactionUtil } from "../../../utils/TransactionUtil";

@Injectable()
@UseFilters(GlobalExceptionFilter)
export class QuestionProvider {
  constructor(
    @InjectModel(QuestionModel) private questionModel: QuestionModel
  ) {
  }

  async add(questions: QuestionDto[], testModel: TestModel): Promise<boolean> {
    const records = [];
    questions.map(el => {
      const { answers, ...data } = el;
      records.push({
        test_id: testModel.id,
        type_id: testModel.type_id,
        value: JSON.stringify(el.answers),
        ...data
      });
    });
    await QuestionModel.bulkCreate(records, TransactionUtil.getHost());
    return true;
  }

  async removeByTest(testId: number): Promise<void> {
    await QuestionModel.destroy({
      where: {
        test_id: testId
      },
      ...TransactionUtil.getHost()
    });
  }

  // async getOne(id: number): Promise<QuestionModel> {
  //   return await QuestionModel.findOne({
  //     where: {
  //       id
  //     }
  //   });
  // }

  async getAll(ids: number[]): Promise<QuestionModel[]> {
    return await QuestionModel.findAll({
      where: {
        id: ids
      }
    });
  }
}
