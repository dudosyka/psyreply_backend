import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TestModel } from "../models/test.model";
import { TestCreateDto } from "../dtos/test-create.dto";
import { QuestionProvider } from "../../question/providers/question.provider";
import { Sequelize } from "sequelize-typescript";
import { TestUpdateDto } from "../dtos/test-update.dto";
import { BlockProvider } from "../../block/providers/block.provider";
import { TestFilterDto } from "../dtos/test-filter.dto";
import { QuestionTypeModel } from "../../question-type/models/question-type.model";
import { MetricModel } from "../../metric/models/metric.model";
import { QuestionModel } from "../../question/models/question.model";
import { TestPassDto } from "../../result/dto/result-create.dto";
import { OperandType, Parsed, ShlyapaMarkupUtil } from "../../../utils/shlyapa-markup.util";
import { TestResultDto } from "../dtos/test-result.dto";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { BaseProvider } from "../../base/base.provider";

@Injectable()
export class TestProvider extends BaseProvider<TestModel> {
  constructor(
    @InjectModel(TestModel) private testModel: TestModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(QuestionProvider) private questionProvider: QuestionProvider,
    @Inject(ShlyapaMarkupUtil) private markupUtil: ShlyapaMarkupUtil,
    private sequelize: Sequelize
  ) {
    super(TestModel)
  }

  async create(test: TestCreateDto, authorId: number): Promise<TestModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const testModel = await TestModel.create({
      title: test.title,
      author_id: authorId,
      type_id: test.type,
      formula: test.formula,
      metric_id: test.metric
    }, TransactionUtil.getHost());

    await this.questionProvider.add(test.questions, testModel).then(async () => {
      if (test.block_id) {
        await this.blockProvider.appendTests(test.block_id, [testModel.id]).catch(err => {
          throw err;
        });
      }
    }).catch(err => {
      TransactionUtil.rollback();
      throw err;
    });

    if (!isPropagate)
      await TransactionUtil.commit();

    return testModel;
  }

  async remove(testId: number): Promise<boolean> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    await this.questionProvider.removeByTest(testId);
    await this.blockProvider.excludeTestFromAll(testId);

    return (await TestModel.destroy({
      where: {
        id: testId
      },
      ...TransactionUtil.getHost()
    }).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    }).then(res => {
      if (!isPropagate)
        TransactionUtil.commit()
      if (res > 0)
        return res;
      else
        throw new ModelNotFoundException(TestModel, testId)
    })) > 0;
  }

  async update(testUpdate: TestUpdateDto): Promise<TestModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const testModel = await TestModel.findOne({
      where: {
        id: testUpdate.id
      }
    });

    testUpdate.questions = testUpdate.questions.map(el => {
      el.value = JSON.stringify(el.answers)
      return el;
    })

    if (!testModel)
      throw new ModelNotFoundException(TestModel, testUpdate.id);

    const { questions, ...onUpdate } = testUpdate;
    await testModel.update({
      ...onUpdate
    });

    await this.questionProvider.removeByTest(testUpdate.id);
    await this.questionProvider.add(questions, testModel).catch(err => {
      throw err;
    });

    if (!isPropagate)
      await TransactionUtil.commit()

    return testModel;
  }

  async move(tests: number[], blockId: number): Promise<boolean> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return await Promise.all(
      tests.map(async testId => {
        const testModel = await TestModel.findOne({
          where: {
            id: testId
          }
        });

        if (!testModel)
          throw new ModelNotFoundException(TestModel, testId);

        await this.blockProvider.appendTests(blockId, [testModel.id]).catch(err => {
          throw err;
        });
      }
    ))
    .catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    }).then(() => {
      if (!isPropagate)
        TransactionUtil.commit();
      return true;
    });
  }

  async removeFromBlock(tests: number[], blockId: number): Promise<boolean> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return await Promise.all(tests.map(async testId => {
      await this.blockProvider.excludeTest(testId, blockId).catch(err => {
        throw err;
      });
    })).catch(err => {
      TransactionUtil.rollback();
      throw err;
    }).then(() => {
      if (!isPropagate)
        TransactionUtil.commit()
      return true;
    });
  }

  async getAll(filters: TestFilterDto): Promise<TestModel[]> {
    if (filters.block_id)
      return await this.blockProvider.includes(filters.block_id);
    if (filters.except_block)
      return await this.getExceptBlock(filters.except_block);

    const { block_id, except_block, ...filter } = filters;

    return super.getAll({
      where: {
        ...filter
      },
      include: [QuestionTypeModel, MetricModel]
    });
  }

  async getOne(testId: number): Promise<TestModel> {
    return super.getOne({
      where: { id: testId },
      include: [QuestionTypeModel, MetricModel, QuestionModel]
    });
  }

  async pass(test: TestPassDto): Promise<TestResultDto> {
    //In TestPassDto we have real questions ids (which are in `id` column)
    const passDtoQuestions = test.answers.map(el => el.question_id);
    //We get all questions
    let questions = await this.questionProvider.getAll(passDtoQuestions);
    //Our formula use relative_ids, so we need to search in questions by relative_id
    const getQuestionValue = async relative_id => {
      let sum = 0;
      //This is all questions in formula
      questions.map(el => {
        //We found question of formula which have relative_id that we need
        if (el.relative_id == relative_id) {
          //We get answer arrays from Dto
          let passDtoQuestion = test.answers.filter(quest => quest.question_id == el.id)[0];
          //We get answer array from question
          const answers = JSON.parse(el.value);
          answers.map(el => {
            //if answer from dto contains some ids from question-answer we sum it
            //Sometimes happens that test is created with answers which ids started not from 1
            // For example:
            //   [
            //     { id: 6, title: 'Никогда', value: 0 },
            //     { id: 7, title: 'Очень редко', value: 1 },
            //     { id: 8, title: 'Редко', value: 2 },
            //     { id: 9, title: 'Иногда', value: 3 },
            //     { id: 10, title: 'Часто', value: 4 },
            //     { id: 11, title: 'Очень часто', value: 5 },
            //     { id: 12, title: 'Ежедневно', value: 6 }
            //   ]
            // So, we need to minus all ids on first answer id value (6 in example) of course except first answer in a row
            // -----------------------------------------------(|)
            //(el.id !== answers[0].id) ? el.id - answers[0].id : el.id
            if (passDtoQuestion.answer.includes(el.id))
              sum += parseInt(el.value);
          });
        }
      });
      return sum;
    };
    const testModel = await this.getOne(test.test_id);
    const formula: Parsed = this.markupUtil.parse(testModel.formula);
    let testResult = 0;
    await Promise.all(formula.markup.map(async el => {
      let itemValue = 0;
      let multiplier = 1;

      if (el.sum) {
        if (el.sum.type == OperandType.CONST) {
          itemValue += (el.sum.value * el.sum.sign);
        } else {
          itemValue += (await getQuestionValue(el.sum.value)) * el.sum.sign;
        }
      }

      if (el.composition) {
        if (el.composition.type == OperandType.CONST) {
          multiplier = el.item.value * el.item.sign;
        } else {
          multiplier = (await getQuestionValue(el.composition.value)) * el.composition.sign;
        }
      }

      if (el.item.type == OperandType.CONST) {
        itemValue += (el.item.value * el.item.sign) * multiplier;
      } else {
        itemValue += (await getQuestionValue(el.item.value)) * el.item.sign * multiplier;
      }
      testResult += itemValue;
    }));

    return {
      metric_id: testModel.metric.id,
      value: Math.round(testResult / formula.div * 100)
    };
  }

  private async getExceptBlock(blockId: number): Promise<TestModel[]> {
    const tests: number[] = (await this.blockProvider.includes(blockId)).map(el => el.id);
    const allTests = await this.getAll({});
    return allTests.filter(test => {
      return !(tests.includes(test.id));
    });
  }

}
