import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TestBlockModel } from "../models/test-block.model";
import { TestBlockCreateDto } from "../dtos/test-block-create.dto";
import { Transaction } from "sequelize";

@Injectable()
export class TestBlockProvider {
  constructor(
    @InjectModel(TestBlockModel) private testBlockModel: TestBlockModel
  ) {
  }

  public async create(createDto: TestBlockCreateDto[], host: { transaction: Transaction }): Promise<TestBlockModel[]> {
    const records = [];
    createDto.map(el => records.push({ ...el }))
    return await TestBlockModel.bulkCreate(records, host);
  }

  public async exclude(testId: number, blockId: number, host: { transaction: Transaction }, confirmLast: boolean): Promise<number> {
    const blocks = await this.getBlocks(testId);
    if (!confirmLast && blocks.length <= 1) {
      throw new Error("Failed remove, there are no blocks");
    }
    return await TestBlockModel.destroy({
      where: {
        block_id: blockId,
        test_id: testId
      },
      ...host
    }).then(() => blocks.length);
  }

  public async getBlocks(testId: number): Promise<number[]> {
    return (await TestBlockModel.findAll({
      where: {
        test_id: testId
      }
    })).map(el => el.block_id)
  }

  public async getTests(blockId: number): Promise<number[]> {
    return (await TestBlockModel.findAll({
      where: {
        test_id: blockId
      }
    })).map(el => el.test_id)
  }
}
