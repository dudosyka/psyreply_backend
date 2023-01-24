import { Injectable, UseFilters } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QuestionModel } from "../models/question.model";
import { QuestionDto } from "../dtos/question.dto";
import { TestModel } from "../../test/models/test.model";
import { GlobalExceptionFilter } from "../../../filters/global-exception.filter";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { BaseProvider } from "../../base/base.provider";

@Injectable()
@UseFilters(GlobalExceptionFilter)
export class QuestionProvider extends BaseProvider<QuestionModel> {
  constructor(
    @InjectModel(QuestionModel) private questionModel: QuestionModel
  ) {
    super(QuestionModel)
  }

  async add(questions: QuestionDto[], testModel: TestModel): Promise<boolean> {
    let records = [];
    questions.forEach((el) => {
      const { answers, ...data } = el;
      records.push({
        test_id: testModel.id,
        type_id: testModel.type_id,
        value: JSON.stringify(el.answers),
        ...data,
        id: null,
      });
    });
    console.log(records);
    records = records.map((el) => {
      return {
        ...el,
        id: null,
      };
    });
    console.log(records);
    await QuestionModel.bulkCreate(records, TransactionUtil.getHost());
    return true;
  }

  async removeByTest(testId: number): Promise<void> {
    await QuestionModel.destroy({
      where: {
        test_id: testId,
      },
      ...TransactionUtil.getHost(),
    });
  }

  async getAll(ids: number[]): Promise<QuestionModel[]> {
    return super.getAll({
      where: {
        id: ids,
      },
    });
  }
}
