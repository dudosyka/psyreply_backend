import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BlockModel } from "../models/block.model";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { TestBlockProvider } from "../../test-block/providers/test-block.provider";
import { TestBlockCreateDto } from "../../test-block/dtos/test-block-create.dto";
import { BlockFilterDto } from "../dtos/block-filter.dto";
import { BlockUpdateDto } from "../dtos/block-update.dto";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";

@Injectable()
export class BlockProvider {
  constructor(
    @InjectModel(BlockModel) private blockModel: BlockModel,
    @Inject(TestBlockProvider) private testBlockProvider: TestBlockProvider,
    private sequelize: Sequelize
  ) {
  }

  private createTestBlockDto(blockId: number, tests: number[]): TestBlockCreateDto[] {
    return tests.map(el => {
      return {
        block_id: blockId,
        test_id: el
      }
    })
  }

  async getAll(filter: BlockFilterDto): Promise<BlockModel[]> {
    return await BlockModel.findAll({
      where: {
        ...filter
      }
    });
  }

  async getOne(blockId: number): Promise<BlockModel> {
    return BlockModel.findOne({
      where: {
        id: blockId,
      }
    })
  }

  async create(createDto: BlockCreateDto): Promise<BlockModel> {
    return await (new Promise(async (resolve, reject) => {
      await this.sequelize.transaction(async t => {
        const host = { transaction: t };
        await BlockModel.create({
           name: createDto.name
        }).then(async res => {
          await this.appendTests(res.id, createDto.tests, host).then(() => res).catch(err => reject(err));
        }).catch(err => reject(err));
      })
    }))
  }

  async remove(blockId: number): Promise<boolean> {
    return (await BlockModel.destroy({
      where: {
        id: blockId
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

  async excludeTest(testId: number, blockId: number, host: { transaction: Transaction }, confirmLast: boolean = false): Promise<number> {
   return await this.testBlockProvider.exclude(testId, blockId, host, confirmLast);
  }

  async appendTests(blockId: number, tests: number[], host: { transaction: Transaction }): Promise<boolean> {
    return !!(await this.testBlockProvider.create(this.createTestBlockDto(blockId, tests), host));
  }

  async copyToCompany(blockId: number, companyId: number): Promise<BlockModel> {
    const block = await this.getOne(blockId);
    return await this.create({
      ...block,
      company_id: companyId,
      tests: await this.testBlockProvider.getTests(blockId)
    });
  }

  async onCompanyRemove(companyId: number, removeBlocks: boolean): Promise<boolean> {
    if (removeBlocks) {
      return (await BlockModel.destroy({
        where: {
          company_id: companyId
        }
      })) > 0;
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
}
