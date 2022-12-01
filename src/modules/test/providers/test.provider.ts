import { HttpException, Inject, Injectable, NotFoundException } from "@nestjs/common";
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
import { OperandType, ShlyapaMarkup, ShlyapaMarkupUtil } from "../../../utils/shlyapa-markup.util";
import { TestResultDto } from "../dtos/test-result.dto";

@Injectable()
export class TestProvider {
  constructor(
    @InjectModel(TestModel) private testModel: TestModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(QuestionProvider) private questionProvider: QuestionProvider,
    @Inject(ShlyapaMarkupUtil) private markupUtil: ShlyapaMarkupUtil,
    private sequelize: Sequelize
  ) {
  }

  async create(test: TestCreateDto, authorId: number): Promise<TestModel> {
    return await (new Promise<TestModel>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t };
        const testModel = await TestModel.create({
          title: test.title,
          author_id: authorId,
          type_id: test.type,
          formula: test.formula,
          metric_id: test.metric
        }, host);
        await this.questionProvider.add(test.questions, testModel, host).then(async () => {
          if (test.block_id) {
            await this.blockProvider.appendTests(test.block_id, [ testModel.id ], host).catch(err => {
              host.transaction.rollback()
              reject(err)
            });
          }
          resolve(testModel)
        }).catch(err => {
          host.transaction.rollback()
          reject(err)
        });

      }).catch(err => {
        reject(err)
      })
    }));
  }

  async remove(testId: number): Promise<boolean> {
    await this.questionProvider.removeByTest(testId);
    await this.blockProvider.excludeTestFromAll(testId);
    return (await TestModel.destroy({
      where: {
        id: testId
      }
    })) > 0;
  }

  async update(testUpdate: TestUpdateDto): Promise<TestModel> {
    return await (new Promise<TestModel>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        const testModel = await TestModel.findOne({
          where: {
            id: testUpdate.id
          }
        });
        if (!testModel)
          reject(new HttpException("Test not found", 404));
        const { questions, ...onUpdate } = testUpdate;
        await testModel.update({
          ...onUpdate
        });
        await this.questionProvider.removeByTest(testUpdate.id);
        await this.questionProvider.add(questions, testModel, host).then(() => resolve(testModel)).catch(err => reject(err))
        return testModel;
      }).catch(err => reject(err))
    }))
  }

  async move(tests: number[], blockId: number, exclude: boolean = false): Promise<boolean> {
    return await (new Promise<boolean>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        await Promise.all(tests.map(async testId => {
          const testModel = await TestModel.findOne({
            where: {
              id: testId
            }
          });
          // TODO: Remove...
          if (exclude)
            await this.blockProvider.excludeTest(blockId, testId, host);
          await this.blockProvider.appendTests(blockId, [ testModel.id ], host).then(() => resolve(true)).catch(err => {
            throw err;
          });
        })).catch(err => {
          host.transaction.rollback()
          reject(err)
        });
      }).catch(err => reject(err))
    }))
  }

  async removeFromBlock(tests: number[], blockId: number, confirmIfLast: boolean): Promise<boolean> {
    return await (new Promise<boolean>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        await Promise.all(tests.map(async testId => {
          await this.blockProvider.excludeTest(testId, blockId, host, confirmIfLast).then(() => resolve(true)).catch(err => {
            throw err
          });
        })).catch(err => {
          host.transaction.rollback();
          reject(err);
        })
        // Now tests can live without blocks
        // if (leftBlocksCount <= 1 && confirmIfLast) {
        //   await this.questionProvider.removeByTest(testId);
        //   await TestModel.destroy({
        //     where: {
        //       id: testId
        //     },
        //     transaction: host.transaction
        //   }).then(() => resolve(true))
        // }
      });
    }));
  }

  private async getExceptBlock(blockId: number): Promise<TestModel[]> {
    const tests: number[] = (await this.blockProvider.includes(blockId)).map(el => el.id);
    const allTests = await this.getAll({});
    return allTests.filter(test => {
      return !(tests.includes(test.id));
    })
  }

  async getAll(filters: TestFilterDto): Promise<TestModel[]> {

    if (filters.block_id)
      return await this.blockProvider.includes(filters.block_id);
    if (filters.except_block)
      return await this.getExceptBlock(filters.except_block);

    const { block_id, except_block, ...filter } = filters;
    return TestModel.findAll({
      where: {
        ...filter
      },
      include: [QuestionTypeModel, MetricModel]
    });
  }

  async getOne(testId: number): Promise<TestModel> {
    const model = await TestModel.findOne({where:{id: testId}, include: [QuestionTypeModel, MetricModel, QuestionModel]})
    if (model)
      return model;
    throw new NotFoundException("Test not found");
  }

  async pass(test: TestPassDto): Promise<TestResultDto> {
    //In TestPassDto we have real questions ids (which are in `id` column)
    const passDtoQuestions = test.answers.map(el => el.question_id);
    //We get all questions
    let questions = await this.questionProvider.getAll(passDtoQuestions);
    //Our formula use relative_ids so we need to search in questions by relative_id
    const getQuestionValue = async relative_id => {
      let sum = 0;
      //This is all questions in formula
      questions.map(el => {
        //We found question of formula which have relative_id that we need
        if (el.relative_id == relative_id) {
          //We get answer arrays from Dto
          let passDtoQuestion = test.answers.filter(quest => quest.question_id == el.id)[0]
          //We get answer array from question
          const answers = JSON.parse(el.value);
          answers.map(el => {
            //if answer from dto contains some ids from question-answer we sum it
            if (passDtoQuestion.answer.includes(el.id))
              sum += parseInt(el.value);
          })
        }
      });
      return sum;
    }
    const testModel = await this.getOne(test.test_id);
    const formula: ShlyapaMarkup[] = this.markupUtil.parse(testModel.formula);
    let testResult = 0
    await Promise.all(formula.map(async el => {
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
      }
      else {
        itemValue += (await getQuestionValue(el.item.value)) * el.item.sign * multiplier
      }
      testResult += itemValue;
    }));
    return {
      metric_id: testModel.metric.id,
      value: testResult
    }
  }
}
