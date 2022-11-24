import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TestModel } from "../models/test.model";
import { TestCreateDto } from "../dtos/test-create.dto";
import { QuestionProvider } from "../../question/providers/question.provider";
import { Sequelize } from "sequelize-typescript";
import sequelize from "sequelize";
import { TestUpdateDto } from "../dtos/test-update.dto";
import { BlockModel } from "../../block/models/block.model";
import { BlockProvider } from "../../block/providers/block.provider";

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

        if (!test.block_id) {
          const createBlockDto = {
            name: `Блок без имени для ${test.title}`,
            tests: [testModel.id]
          };
          await this.blockProvider.create(createBlockDto, host).then(() => resolve(testModel)).catch(err => {
            host.transaction.rollback()
            reject(err);
          });
        } else {
          await this.blockProvider.appendTests(test.block_id, [ testModel.id ], host).then(() => resolve(testModel)).catch(err => {
            host.transaction.rollback()
            reject(err)
          });
        }
      }).catch(err => {
        reject(err)
      })
    }));
  }

  async remove(testId: number): Promise<number> {
    await this.questionProvider.removeByTest(testId);
    return TestModel.destroy({
      where: {
        id: testId
      }
    });
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
}
