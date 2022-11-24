import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BlockModel } from "../models/block.model";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { TestBlockProvider } from "../../test-block/providers/test-block.provider";
import { TestBlockCreateDto } from "../../test-block/dtos/test-block-create.dto";
import { Transaction } from "sequelize";

@Injectable()
export class BlockProvider {
  constructor(
    @InjectModel(BlockModel) private blockModel: BlockModel,
    @Inject(TestBlockProvider) private testBlockProvider: TestBlockProvider
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

  async create(createDto: BlockCreateDto, host: { transaction: Transaction }): Promise<BlockModel> {
    return await (new Promise(async (resolve, reject) => {
      const block = await BlockModel.create({
        name: createDto.name
      }, host);
      await this.testBlockProvider.create(this.createTestBlockDto(block.id, createDto.tests), host).catch(err => reject(err));
      resolve(block);
    }))
  }

  async excludeTest(testId: number, blockId: number, host: { transaction: Transaction }, confirmLast: boolean = false): Promise<number> {
   return await this.testBlockProvider.exclude(testId, blockId, host, confirmLast);
  }

  async appendTests(blockId: number, tests: number[], host: { transaction: Transaction }): Promise<boolean> {
    return !!(await this.testBlockProvider.create(this.createTestBlockDto(blockId, tests), host));
  }
}
