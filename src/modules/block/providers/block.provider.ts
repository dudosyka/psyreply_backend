import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BlockModel } from "../models/block.model";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { TestBlockProvider } from "../../test-block/providers/test-block.provider";
import { TestBlockCreateDto } from "../../test-block/dtos/test-block-create.dto";
import { BlockFilterDto } from "../dtos/block-filter.dto";
import { BlockUpdateDto } from "../dtos/block-update.dto";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";
import { TestModel } from "../../test/models/test.model";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { TransactionUtil } from "../../../utils/TransactionUtil";

@Injectable()
export class BlockProvider {
  constructor(
    @InjectModel(BlockModel) private blockModel: BlockModel,
    @Inject(TestBlockProvider) private testBlockProvider: TestBlockProvider,
    private sequelize: Sequelize
  ) {
  }

  async getAll(filter: BlockFilterDto): Promise<BlockModel[]> {
    const { exclude_test, ...filters } = filter;
    if (filter.exclude_test) {
      return await BlockModel.findAll({
        where: {
          ...filters
        },
        include: [TestModel]
      }).then(el => {
        return el.filter(block => {
          const tests = block.tests.map(el => el.id);
          return !(tests.includes(exclude_test));
        });
      });
    }
    return await BlockModel.findAll({
      where: {
        ...filters
      },
      include: [TestModel]
    });
  }

  async getOne(blockId: number, rawData: boolean = false): Promise<BlockModel> {
    return new Promise<BlockModel>(async (resolve) => {
      resolve(BlockModel.findOne({
        where: {
          id: blockId
        },
        include: rawData ? [] : [TestModel]
      }));
    });
  }

  async createModel(createDto: BlockCreateDto, transaction: { transaction: Transaction } = { transaction: null }): Promise<BlockModel> {
    return await (new Promise(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t };
        const block = await BlockModel.create({
          name: createDto.name,
          company_id: createDto.company_id
        }, transaction.transaction != null ? transaction : {}).catch(err => {
          reject(err);
          return block;
        });
        await this.appendTests(block.id, createDto.tests, transaction.transaction != null ? transaction : host).then(() => resolve(block)).catch(err => reject(err));
      }).catch(err => {
        reject(err);
      });
    }));
  }

  async remove(blocks: number[]): Promise<boolean> {
    await this.testBlockProvider.removeAllRelations(0, blocks);
    return (await BlockModel.destroy({
      where: {
        id: blocks
      }
    })) > 0;
  }

  async update(blockId: number, updateDto: BlockUpdateDto): Promise<BlockModel> {
    await BlockModel.update({
      ...updateDto
    }, {
      where: {
        id: blockId
      }
    });
    return await BlockModel.findOne({ where: { id: blockId } });
  }

  async excludeTestFromAll(testId: number): Promise<boolean> {
    return await this.testBlockProvider.removeAllRelations(testId);
  }

  async includes(blockId: number): Promise<TestModel[]> {
    const blocks = await this.getAll({
      id: blockId
    });
    const ids = [];
    const tests: TestModel[] = [];
    blocks.map(el => {
      el.tests.map(test => {
        if (!ids.includes(test.id))
          tests.push(test);
      });
    });
    return tests;
  }

  async excludeTest(testId: number, blockId: number, host: { transaction: Transaction }, confirmLast: boolean = false): Promise<boolean> {
    return await this.testBlockProvider.exclude(testId, blockId, host, confirmLast);
  }

  async appendTests(blockId: number, tests: number[], host: { transaction: Transaction }): Promise<boolean> {
    const relation = (await this.testBlockProvider.getTests(blockId));
    tests = tests.filter(el => {
      if (relation.includes(el))
        throw new HttpException("Double record", 409);
      else
        return true;
    });
    return !!(await this.testBlockProvider.create(this.createTestBlockDto(blockId, tests), host));
  }

  async copyToCompany(blocks: number[], companyId: any, transaction: { transaction: Transaction } = { transaction: null }): Promise<BlockModel[]> | never {

    // if (!TransactionUtil.isSet())
    //   TransactionUtil.setHost(await this.sequelize.transaction());
    //
    // return await Promise.all(blocks.map(async (blockId: number) => {
    //
    //   const block = await this.getOne(blockId, true);
    //   if (!block)
    //     throw new ModelNotFoundException(BlockModel, blockId);
    //
    //   return await this.createModel({
    //     name: block.name,
    //     company_id: companyId,
    //     tests: await this.testBlockProvider.getTests(blockId)
    //   }, TransactionUtil.getHost())
    //     .catch(err => {
    //       throw err;
    //     })
    //     .then(data => data);
    //
    // })).catch(err => {
    //   TransactionUtil.rollback();
    //   throw err;
    // });

    return await (new Promise(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = transaction.transaction ? transaction : { transaction: t };
        await Promise.all(blocks.map(async blockId => {
          const block = await this.getOne(blockId, true);
          if (!block) {
            throw new ModelNotFoundException(BlockModel, blockId);
          }
          return await this.createModel({
            name: block.name,
            company_id: parseInt(companyId),
            tests: await this.testBlockProvider.getTests(block.id)
          }, host).catch(err => {
            throw err;
          }).then(block => block);
        })).catch(err => {
          host.transaction.rollback();
          reject(err);
        }).then(data => data ? resolve(data) : resolve(null));
      }).catch(err => reject(err));
    }));
  }

  async onCompanyRemove(companyId: number, removeBlocks: boolean): Promise<boolean> {
    if (removeBlocks) {
      await Promise.all((await BlockModel.findAll({
        where: {
          company_id: companyId
        }
      })).map(async el => {
        await this.remove([el.id]);
      }));
      return true;
    } else {
      return !!(await BlockModel.update({
        company_id: null
      }, {
        where: {
          company_id: companyId
        }
      }));
    }

  }

  async testTransactionHost() {
    TransactionUtil.setHost(await this.sequelize.transaction());
    await BlockModel.update({
      name: ""
    }, {
      where: {
        id: 2
      },
      ...TransactionUtil.getHost()
    });
    await this.testBlockProvider.test().catch(err => {
      TransactionUtil.rollback().catch(err => {
        console.log(err);
      });
      throw err;
    });
  }

  private createTestBlockDto(blockId: number, tests: number[]): TestBlockCreateDto[] {
    return tests.map(el => {
      return {
        block_id: blockId,
        test_id: el
      };
    });
  }
}
