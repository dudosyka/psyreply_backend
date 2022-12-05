import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BlockModel } from "../models/block.model";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { TestBlockProvider } from "../../test-block/providers/test-block.provider";
import { TestBlockCreateDto } from "../../test-block/dtos/test-block-create.dto";
import { BlockFilterDto } from "../dtos/block-filter.dto";
import { BlockUpdateDto } from "../dtos/block-update.dto";
import { Sequelize } from "sequelize-typescript";
import { TestModel } from "../../test/models/test.model";
import { ModelNotFoundException } from "../../../exceptions/model-not-found.exception";
import { TransactionUtil } from "../../../utils/TransactionUtil";
import { ResultModel } from "../../result/models/result.model";
import { CompanyModel } from "../../company/models/company.model";

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
        include: [TestModel, CompanyModel]
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
      include: [TestModel, CompanyModel]
    });
  }

  async getOne(blockId: number, rawData: boolean = false): Promise<BlockModel> {
    const block = await BlockModel.findOne({
      where: {
        id: blockId
      },
      include: rawData ? [] : [TestModel]
    });

    if (!block)
      throw new ModelNotFoundException(BlockModel, blockId);

    return block;
  }

  async createModel(createDto: BlockCreateDto): Promise<BlockModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const block = await BlockModel.create({
      name: createDto.name,
      company_id: createDto.company_id
    }, TransactionUtil.getHost()).catch(err => {
      throw err;
    }).then(block => block);

    await this.appendTests(block.id, createDto.tests).catch(err => {
      throw err;
    });

    if (!isPropagate) {
      await TransactionUtil.commit();
    }

    return block;
  }

  async remove(blocks: number[]): Promise<boolean> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    await this.testBlockProvider.removeAllRelations(0, blocks);


    return await Promise.all(blocks.map(async id => {
      const block = await BlockModel.findOne({
        where: {
          id
        }
      });
      if (!block)
        throw new ModelNotFoundException(BlockModel, id)

      await ResultModel.update({
        block_title: block.name
      }, {
        where: {
          block_id: id
        },
        ...TransactionUtil.getHost()
      });

      await BlockModel.destroy({
        where: {
          id
        },
        ...TransactionUtil.getHost()
      })
    })).then(() => {
      if (!isPropagate)
        TransactionUtil.commit();
      return true;
    }).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    })
  }

  async update(blockId: number, updateDto: BlockUpdateDto): Promise<BlockModel> {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    const block = await BlockModel.findOne({
      where: {
        id: blockId,
      }
    });
    if (!block) {
      if (!isPropagate)
        await TransactionUtil.rollback();
      throw new ModelNotFoundException(BlockModel, blockId);
    }

    await block.update({
      ...updateDto
    })

    await ResultModel.update({
      block_title: block.name
    },{
      where: {
        block_id: blockId
      },
      ...TransactionUtil.getHost()
    });

    if (!isPropagate)
      await TransactionUtil.commit();

    return block;
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

  async excludeTest(testId: number, blockId: number): Promise<boolean> {
    return await this.testBlockProvider.exclude(testId, blockId);
  }

  async appendTests(blockId: number, tests: number[]): Promise<boolean> {
    const relation = (await this.testBlockProvider.getTests(blockId));
    tests = tests.filter(el => {
      if (relation.includes(el))
        throw new HttpException("Double record", 409);
      else
        return true;
    });
    return !!(await this.testBlockProvider.create(this.createTestBlockDto(blockId, tests)));
  }

  async copyToCompany(blocks: number[], companyId: any): Promise<BlockModel[]> | never {

    let isPropagate = true;
    if (!TransactionUtil.isSet()) {
      isPropagate = false;
      TransactionUtil.setHost(await this.sequelize.transaction());
    }

    return await Promise.all(blocks.map(async (blockId: number) => {

      const block = await this.getOne(blockId, true);
      if (!block)
        throw new ModelNotFoundException(BlockModel, blockId);

      return await this.createModel({
        name: block.name,
        company_id: companyId,
        tests: await this.testBlockProvider.getTests(blockId)
      })
        .catch(err => {
          throw err;
        })
        .then(data => data);

    })).catch(err => {
      if (!isPropagate)
        TransactionUtil.rollback();
      throw err;
    }).then(async data => {
      if (!isPropagate)
        await TransactionUtil.commit();
      return await this.getAll({ id: data.map(el => el.id) });
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
