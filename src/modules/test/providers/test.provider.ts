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

@Injectable()
export class TestProvider {
  constructor(
    @InjectModel(TestModel) private testModel: TestModel,
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(QuestionProvider) private questionProvider: QuestionProvider,
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
        await this.questionProvider.add(test.questions, testModel, host).catch(err => reject(err));

        if (test.block_id) {
          await this.blockProvider.appendTests(test.block_id, [ testModel.id ], host).catch(err => {
            host.transaction.rollback()
            reject(err)
          });
        }
        resolve(testModel)
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

  async move(testId: number, blockId: number, exclude: boolean = false): Promise<boolean> {
    return await (new Promise<boolean>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        const testModel = await TestModel.findOne({
          where: {
            id: testId
          }
        });
        // TODO: Remove...
        if (exclude)
          await this.blockProvider.excludeTest(blockId, testId, host);
        await this.blockProvider.appendTests(blockId, [ testModel.id ], host).then(() => resolve(true)).catch(err => {
          host.transaction.rollback()
          reject(err)
        });
      }).catch(err => reject(err))
    }))
  }

  async removeFromBlock(testId: number, blockId: number, confirmIfLast: boolean): Promise<boolean> {
    return await (new Promise<boolean>(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t }
        await this.blockProvider.excludeTest(testId, blockId, host, confirmIfLast).then(() => resolve(true)).catch(err => reject(err))
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

  async getAll(filters: TestFilterDto): Promise<TestModel[]> {
    if (filters.block_id)
      return await this.blockProvider.includes(filters.block_id);
    const { block_id, ...filter } = filters;
    return TestModel.findAll({
      where: {
        ...filter
      },
      include: [QuestionTypeModel, MetricModel]
    });
  }

  async getOne(testId: number): Promise<TestModel> {
    const model = await TestModel.findOne({where:{id: testId}, include: [QuestionTypeModel, MetricModel]})
    if (model)
      return model;
    throw new NotFoundException("Test not found");
  }
}
